import { Application as ArgoApplication } from '@imports/argoproj.io'
import { Context, Environment } from '@libs/context'
import { App as CDKScope, Chart as CDKChart } from 'cdk8s'
import { includes } from 'ramda'

export const ANNOTATION_ARGOCD_HOOK = 'argocd.argoproj.io/hook'
export const ANNOTATION_ARGOCD_HOOK_DELETE_POLICY = 'argocd.argoproj.io/hook-delete-policy'
export const ANNOTATION_ARGOCD_SYNC_OPTIONS = 'argocd.argoproj.io/sync-options'

export const ARGOCD_OUTPUT_FILE_EXTENSION = '.yaml'

export const ARGOCD_REPOSITORY_PROJECT = 'node-packages'

let environmentsScope: CDKScope
const getEnvironmentsScope = () => {
	if (!environmentsScope) {
		environmentsScope = new CDKScope({
			outdir: `environments`,
			outputFileExtension: ARGOCD_OUTPUT_FILE_EXTENSION
		})
	}
	return environmentsScope
}

const environmentCharts = new Map<Environment, CDKChart>()
const getEnvironmentChart = (environment: Environment): CDKChart => {
	return (
		environmentCharts.get(environment) ??
		(() => {
			const chart = new CDKChart(getEnvironmentsScope(), environment)
			environmentCharts.set(environment, chart)
			return chart
		})()
	)
}

const environmentManifestsScopes = new Map<Environment, CDKScope>()
export const getEnvironmentManifestsScope = (environment: Environment): CDKScope =>
	environmentManifestsScopes.get(environment) ??
	(() => {
		const scope = new CDKScope({
			outdir: `manifests/${environment}`,
			outputFileExtension: ARGOCD_OUTPUT_FILE_EXTENSION
		})
		environmentManifestsScopes.set(environment, scope)
		return scope
	})()

const getTargetRevision = (context: Context) => {
	if (includes(context.environment, ['production', 'staging', 'development'])) {
		return `deploy/${context.environment}`
	}
	return 'main'
}

export const registerApplication = (context: Context) => {
	const chart = getEnvironmentChart(context.environment)
	return new ArgoApplication(chart, context.namespace, {
		metadata: {
			name: context.namespace,
			finalizers: ['resources-finalizer.argocd.argoproj.io']
		},
		spec: {
			project: ARGOCD_REPOSITORY_PROJECT,
			source: {
				repoUrl: 'https://github.com/mxvincent/node-packages.git',
				path: `kubernetes/manifests/${context.environment}`,
				targetRevision: getTargetRevision(context),
				directory: {
					include: `${context.application}${ARGOCD_OUTPUT_FILE_EXTENSION}`,
					recurse: false
				}
			},
			destination: {
				server: 'https://kubernetes.default.svc',
				namespace: context.namespace
			},
			syncPolicy: {
				automated: {
					prune: true,
					selfHeal: true,
					allowEmpty: true
				},
				syncOptions: ['CreateNamespace=true', 'ServerSideApply=true']
			}
		}
	})
}

export const synthesizeAllResources = () => {
	for (const environmentScope of environmentManifestsScopes.values()) {
		environmentScope.synth()
	}
	environmentsScope?.synth()
}
