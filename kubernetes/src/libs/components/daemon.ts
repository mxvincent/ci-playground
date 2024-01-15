import { ComponentFactory, ComponentInterface } from '@libs/app-component'
import { ANNOTATION_RELOAD_ON_SECRET_CHANGE, Provider } from '@libs/app-config'
import { LABEL_COMPONENT } from '@libs/labels'
import { Options } from '@libs/misc'
import { Deployment, EnvValue, Volume } from 'cdk8s-plus-26'
import { includes } from 'ramda'

export class DaemonOptions implements ComponentInterface {
	readonly name: string
	readonly command: string[]
	readonly replicas: Provider<number>

	constructor(name: string, options: Options<DaemonOptions, 'command'>) {
		this.name = name
		this.command = options.command
		this.replicas = options.replicas ?? (() => 1)
	}
}

export class DaemonFactory extends ComponentFactory<DaemonOptions> {
	createResources() {
		const { chart, component, context, config } = this

		const deployment = new Deployment(chart, component.name, {
			replicas: component.replicas(context),
			dockerRegistryAuth: config.dockerRegistryAuthSecret,
			podMetadata: {
				labels: this.labels
			}
		})
		deployment.metadata.addLabel(LABEL_COMPONENT, component.name)
		deployment.metadata.addAnnotation(ANNOTATION_RELOAD_ON_SECRET_CHANGE, config.secretNames.join(','))

		const container = deployment.addContainer(this.containerProps)

		if (config.configFilesSecret) {
			const volume = Volume.fromSecret(chart, `${component.name}-config-files`, config.configFilesSecret)
			deployment.addVolume(volume)
			for (const file of config.configFiles) {
				container.mount(`/app/${file}`, volume, { subPath: file })
			}
			if (includes('config.json', config.configFiles)) {
				container.env.addVariable('CONFIG_FILE_PATH', EnvValue.fromValue('/app/config.json'))
			}
		}
	}
}
