import { AppConfig } from '@libs/app-config'
import { Context } from '@libs/context'
import { getApplicationLabels } from '@libs/labels'
import { Chart, Size } from 'cdk8s'
import { ContainerProps, ContainerResources, Cpu } from 'cdk8s-plus-26'

export const getContainerResources = (options?: Partial<ContainerResources>): ContainerResources => {
	return {
		cpu: {
			request: options?.cpu?.request ?? Cpu.millis(50),
			limit: options?.cpu?.limit ?? undefined
		},
		memory: {
			request: options?.memory?.request ?? Size.mebibytes(100),
			limit: options?.memory?.limit ?? Size.mebibytes(250)
		}
	}
}
export type ComponentInterface = {
	readonly name: string
	readonly command: string[]
}

export type ComponentFactoryOptions<ComponentOptions extends ComponentInterface> = {
	context: Context
	config: AppConfig
	component: ComponentOptions
}

export abstract class ComponentFactory<Component extends ComponentInterface> {
	protected readonly chart: Chart
	protected readonly context: Context
	protected readonly config: AppConfig
	protected readonly component: Component

	constructor(chart: Chart, options: ComponentFactoryOptions<Component>) {
		this.chart = chart
		this.context = options.context
		this.config = options.config
		this.component = options.component
		this.createResources()
	}

	protected get containerProps(): ContainerProps {
		return {
			name: this.component.name,
			command: this.component.command,
			image: this.context.image,
			resources: getContainerResources(),
			envVariables: this.config.environment,
			securityContext: {
				readOnlyRootFilesystem: true,
				ensureNonRoot: false
			}
		}
	}

	protected get labels() {
		return getApplicationLabels(this.context, this.component)
	}

	abstract createResources(): void
}
