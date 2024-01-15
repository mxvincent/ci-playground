import { ComponentInterface } from '@libs/app-component'
import { AppConfig, AppConfigProviders } from '@libs/app-config'
import { getEnvironmentManifestsScope, registerApplication } from '@libs/argocd'
import { CronJobFactory, CronJobOptions } from '@libs/components/cron-job'
import { DaemonFactory, DaemonOptions } from '@libs/components/daemon'
import { JobFactory, JobOptions } from '@libs/components/job'
import { WebServiceFactory, WebServiceOptions } from '@libs/components/web-service'
import { Context } from '@libs/context'
import { getApplicationLabels } from '@libs/labels'
import { Chart as CDKChart } from 'cdk8s'
import { Namespace } from 'cdk8s-plus-26'

/**
 * Service chart is the top level abstraction for deploying a complete application to Kubernetes.
 */
export abstract class AppChart {
	/**
	 * Application context
	 */
	readonly context: Context

	/**
	 * Cdk8s chart
	 */
	readonly chart: CDKChart

	/**
	 * Create application manifest
	 */
	constructor(context: Context) {
		this.chart = new CDKChart(getEnvironmentManifestsScope(context.environment), context.application, {
			namespace: context.namespace,
			labels: getApplicationLabels(context),
			disableResourceNameHashes: true
		})
		this.context = context

		this.createApplicationNamespace()
		this.createApplicationResources()
		registerApplication(this.context)
	}

	/**
	 * Return the list of components to deploy
	 */
	abstract components(context: Context): Array<ComponentInterface>

	/**
	 * Provide config files
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	providers(context: Context): AppConfigProviders {
		return {}
	}

	/**
	 * Create application namespace
	 */
	createApplicationNamespace() {
		new Namespace(this.chart, 'namespace', {
			metadata: { name: this.context.namespace }
		})
	}

	/**
	 * Build all application resources
	 */
	private createApplicationResources() {
		const { chart, context } = this
		const config = new AppConfig(chart, context, this.providers(context))
		for (const component of this.components(context)) {
			if (component instanceof CronJobOptions) {
				new CronJobFactory(chart, { context, component, config })
			}
			if (component instanceof DaemonOptions) {
				new DaemonFactory(chart, { context, component, config })
			}
			if (component instanceof JobOptions) {
				new JobFactory(chart, { context, component, config })
			}
			if (component instanceof WebServiceOptions) {
				new WebServiceFactory(chart, { context, component, config })
			}
		}
	}
}
