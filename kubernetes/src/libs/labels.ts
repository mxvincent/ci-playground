import { ComponentInterface } from '@libs/app-component'
import { Context } from '@libs/context'

export const LABEL_NAME = 'app.kubernetes.io/name'
export const LABEL_VERSION = 'app.kubernetes.io/version'
export const LABEL_COMPONENT = 'app.kubernetes.io/component'
export const LABEL_INSTANCE = 'app.kubernetes.io/instance'

export const getApplicationLabels = (context: Context, component?: ComponentInterface): Record<string, string> => {
	const labels: Record<string, string> = {
		[LABEL_NAME]: context.application,
		[LABEL_VERSION]: context.revision,
		[LABEL_INSTANCE]: context.environment
	}
	if (component) {
		labels[LABEL_COMPONENT] = component.name
	}
	return labels
}
