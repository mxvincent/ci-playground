import { ComponentFactory, ComponentInterface } from '@libs/app-component'
import { LABEL_COMPONENT } from '@libs/labels'
import { Options } from '@libs/misc'
import { Cron } from 'cdk8s'
import { ConcurrencyPolicy, CronJob, EnvValue, RestartPolicy, Volume } from 'cdk8s-plus-26'
import { includes } from 'ramda'

export class CronJobOptions implements ComponentInterface {
	readonly name: string
	readonly command: string[]
	readonly schedule: Cron

	constructor(name: string, options: Options<CronJobOptions, 'command' | 'schedule'>) {
		this.name = name
		this.command = options.command
		this.schedule = options.schedule
	}
}

export class CronJobFactory extends ComponentFactory<CronJobOptions> {
	createResources() {
		const { chart, component, config } = this

		const job = new CronJob(chart, component.name, {
			dockerRegistryAuth: config.dockerRegistryAuthSecret,
			schedule: component.schedule,
			concurrencyPolicy: ConcurrencyPolicy.FORBID,
			restartPolicy: RestartPolicy.ON_FAILURE,
			successfulJobsRetained: 3,
			podMetadata: {
				labels: this.labels
			}
		})
		job.metadata.addLabel(LABEL_COMPONENT, component.name)

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
