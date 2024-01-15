import { ExternalSecretV1Beta1, ExternalSecretV1Beta1SpecTargetCreationPolicy } from '@imports/external-secrets.io'
import { Context } from '@libs/context'
import { Chart as CDKChart, Names } from 'cdk8s'
import { EnvValue, ISecret, Secret } from 'cdk8s-plus-26'
import { curry, is } from 'ramda'

export const ANNOTATION_RELOAD_ON_CONFIGMAP_CHANGE = 'configmap.reloader.stakater.com/reload'
export const ANNOTATION_RELOAD_ON_SECRET_CHANGE = 'secret.reloader.stakater.com/reload'

/**
 * Function taking context as parameter to return a value
 */
export type Provider<T> = (context: Context) => T

/**
 * External secret reference
 */
export type ExternalSecretRef = {
	name: string
	property: string
}

/**
 * Config files secret
 */
export type ConfigFilesContent = Map<string, unknown>
export type ConfigFilesSecrets = Map<string, ExternalSecretRef>
export type ConfigFilesProvider = Provider<{
	content: ConfigFilesContent
	secrets?: ConfigFilesSecrets
}>

/**
 * Environment variables
 */
export type EnvironmentValues = Map<string, string>
export type EnvironmentSecrets = Map<string, ExternalSecretRef>
export type EnvironmentProvider = Provider<{
	values?: EnvironmentValues
	secrets?: EnvironmentSecrets
}>

/**
 * Provide application config
 */
export type AppConfigProviders = {
	environment?: EnvironmentProvider
	configFiles?: ConfigFilesProvider
}

export const secretRef = curry((secret: string, property: string): ExternalSecretRef => {
	return { name: secret, property }
})

export const secretPlaceholder = (property: string) => `{{ .${property} | toString }}`

export class AppConfig {
	static readonly DOCKER_AUTH_EXTERNAL_SECRET_NAME = 'docker-auth'
	static readonly SECRET_REFRESH_INTERVAL = '1h'

	private readonly context: Context
	private readonly providers: AppConfigProviders
	private readonly chart: CDKChart

	dockerRegistryAuthSecret: ISecret
	environment: Record<string, EnvValue>
	environmentSecret?: ISecret
	configFiles: string[]
	configFilesSecret?: ISecret

	get secretNames(): string[] {
		return [this.configFilesSecret?.name, this.environmentSecret?.name].filter(is(String))
	}

	constructor(chart: CDKChart, context: Context, providers: AppConfigProviders = {}) {
		this.chart = chart
		this.context = context
		this.providers = providers
		this.dockerRegistryAuthSecret = this.createDockerRegistryAuth()
		this.environment = this.createEnvironmentSecret()
		this.configFiles = this.createConfigFilesSecret()
	}

	/**
	 * Create docker registry auth secret
	 */
	private createDockerRegistryAuth(): ISecret {
		const { chart } = this
		const secretName = Names.toDnsLabel(chart, { extra: ['docker-auth'], includeHash: false })
		const secret = Secret.fromSecretName(chart, 'docker-auth', secretName)
		new ExternalSecretV1Beta1(chart, 'docker-auth-secret', {
			spec: {
				secretStoreRef: { kind: 'ClusterSecretStore', name: 'scaleway' },
				refreshInterval: AppConfig.SECRET_REFRESH_INTERVAL,
				target: {
					name: secretName,
					creationPolicy: ExternalSecretV1Beta1SpecTargetCreationPolicy.OWNER,
					template: {
						type: 'kubernetes.io/dockerconfigjson',
						data: {
							'.dockerconfigjson': '{{ .secret | toString }}'
						}
					}
				},
				data: [
					{
						secretKey: 'secret',
						remoteRef: {
							conversionStrategy: 'Default',
							decodingStrategy: 'None',
							key: `name:${AppConfig.DOCKER_AUTH_EXTERNAL_SECRET_NAME}`,
							version: 'latest'
						}
					}
				]
			}
		})
		return secret
	}

	/**
	 * Create config map containing application configuration files
	 */
	private createConfigFilesSecret(): string[] {
		const { context, chart, providers } = this

		if (!providers.configFiles) {
			return []
		}

		const provider = providers.configFiles(context)
		const configFiles: string[] = []
		const stringData: Record<string, string> = {}

		for (const [name, content] of provider.content.entries()) {
			configFiles.push(name)
			stringData[name] = typeof content === 'string' ? content : JSON.stringify(content)
		}

		if (!provider.secrets) {
			this.configFilesSecret = new Secret(chart, 'config-files', { stringData })
			return configFiles
		}

		const filesSecretName = Names.toDnsLabel(chart, { extra: ['config-files'], includeHash: false })
		this.configFilesSecret = Secret.fromSecretName(chart, 'config-files', filesSecretName)
		new ExternalSecretV1Beta1(chart, 'config-files-secrets', {
			spec: {
				refreshInterval: AppConfig.SECRET_REFRESH_INTERVAL,
				secretStoreRef: { kind: 'ClusterSecretStore', name: 'scaleway' },
				target: {
					name: filesSecretName,
					creationPolicy: ExternalSecretV1Beta1SpecTargetCreationPolicy.OWNER,
					template: {
						engineVersion: '2',
						data: stringData
					}
				},
				data: [...provider.secrets].map(([placeholder, externalSecret]) => ({
					secretKey: placeholder,
					remoteRef: {
						key: `name:${externalSecret.name}`,
						conversionStrategy: 'Default',
						decodingStrategy: 'None',
						property: externalSecret.property,
						version: 'latest'
					}
				}))
			}
		})

		return configFiles
	}

	/**
	 * Generate environment variables for applications components
	 */
	private createEnvironmentSecret(): Record<string, EnvValue> {
		const { chart, context, providers } = this
		const provider = providers.environment ? providers.environment(context) : {}
		const env: Record<string, EnvValue> = {}

		if (provider.values) {
			for (const [key, value] of provider.values) {
				env[key] = EnvValue.fromValue(value)
			}
		}

		if (provider.secrets) {
			const secretName = Names.toDnsLabel(chart, { extra: ['env-variables'], includeHash: false })
			const envVariablesSecret = Secret.fromSecretName(chart, 'env-variables', secretName)
			new ExternalSecretV1Beta1(chart, 'env-secrets', {
				spec: {
					refreshInterval: AppConfig.SECRET_REFRESH_INTERVAL,
					secretStoreRef: { kind: 'ClusterSecretStore', name: 'scaleway' },
					target: {
						name: secretName,
						creationPolicy: ExternalSecretV1Beta1SpecTargetCreationPolicy.OWNER
					},
					data: [...provider.secrets].map(([property, secret]) => ({
						secretKey: property,
						remoteRef: {
							conversionStrategy: 'Default',
							decodingStrategy: 'None',
							key: `name:${secret.name}`,
							property: secret.property,
							version: 'latest'
						}
					}))
				}
			})
			for (const key of provider.secrets.keys()) {
				env[key] = envVariablesSecret.envValue(key)
			}
		}

		return env
	}
}
