import { ComponentFactory, ComponentInterface } from '@libs/app-component'
import {
	ANNOTATION_ARGOCD_HOOK,
	ANNOTATION_ARGOCD_HOOK_DELETE_POLICY,
	ANNOTATION_ARGOCD_SYNC_OPTIONS
} from '@libs/argocd'
import { getApplicationLabels, LABEL_COMPONENT } from '@libs/labels'
import { Options } from '@libs/misc'
import { EnvValue, Job, RestartPolicy, Volume } from 'cdk8s-plus-26'
import { includes } from 'ramda'

export enum ArgocdHook {
	PostSync = 'PostSync',
	PreSync = 'PreSync',
	Skip = 'Skip',
	Sync = 'Sync',
	SyncFail = 'SyncFail'
}

export enum ArgocdHookDeletePolicy {
	BeforeHookCreation = 'BeforeHookCreation',
	HookFailed = 'HookFailed',
	HookSucceeded = 'HookSucceeded'
}

export class JobOptions implements ComponentInterface {
	readonly name: string
	readonly command: string[]
	readonly hook: ArgocdHook | null
	readonly deletePolicy: ArgocdHookDeletePolicy | null

	constructor(name: string, options: Options<JobOptions, 'command'>) {
		this.name = name
		this.command = options.command
		this.hook = options.hook ?? ArgocdHook.Sync
		this.deletePolicy = options.deletePolicy ?? ArgocdHookDeletePolicy.BeforeHookCreation
	}
}

export class JobFactory extends ComponentFactory<JobOptions> {
	createResources() {
		const { context, chart, component, config } = this

		const job = new Job(chart, component.name, {
			dockerRegistryAuth: config.dockerRegistryAuthSecret,
			restartPolicy: RestartPolicy.ON_FAILURE,
			podMetadata: {
				labels: getApplicationLabels(context, component)
			}
		})
		job.metadata.addLabel(LABEL_COMPONENT, component.name)
		job.metadata.addAnnotation(ANNOTATION_ARGOCD_SYNC_OPTIONS, 'Replace=true')
		if (component.hook) {
			job.metadata.addAnnotation(ANNOTATION_ARGOCD_HOOK, component.hook)
		}
		if (component.deletePolicy) {
			job.metadata.addAnnotation(ANNOTATION_ARGOCD_HOOK_DELETE_POLICY, component.deletePolicy)
		}

		const container = job.addContainer(this.containerProps)

		if (config.configFilesSecret) {
			const volume = Volume.fromSecret(chart, `${component.name}-config-files`, config.configFilesSecret)
			job.addVolume(volume)
			for (const file of config.configFiles) {
				container.mount(`/app/${file}`, volume, { subPath: file })
			}
			if (includes('config.json', config.configFiles)) {
				container.env.addVariable('CONFIG_FILE_PATH', EnvValue.fromValue('/app/config.json'))
			}
		}
	}
}
