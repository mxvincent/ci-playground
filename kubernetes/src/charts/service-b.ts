import { AppChart } from '@libs/app-chart'
import {
	AppConfigProviders,
	ConfigFilesContent,
	ConfigFilesProvider,
	ConfigFilesSecrets,
	secretPlaceholder,
	secretRef
} from '@libs/app-config'
import { WebServiceOptions } from '@libs/components/web-service'

const configFiles: ConfigFilesProvider = (context) => {
	const ACCOUNT_API_KEY = 'ACCOUNT_API_KEY'

	const content: ConfigFilesContent = new Map()
	content.set('config.json', {
		logLevel: 'info',
		app: {
			baseUrl: `${context.environment}.${context.application}.row.ovh`,
			server: {
				host: '0.0.0.0',
				port: 4000
			}
		},
		services: {
			account: {
				baseUrl: `${context.environment}.${context.application}.row.ovh`,
				apiKey: secretPlaceholder(ACCOUNT_API_KEY)
			}
		}
	})
	content.set('data.csv', 'a,123\nb,456\nc,789')

	const secrets: ConfigFilesSecrets = new Map()
	secrets.set(ACCOUNT_API_KEY, secretRef(context.namespace, ACCOUNT_API_KEY))

	return { content, secrets }
}

export class ServiceB extends AppChart {
	components() {
		return [
			new WebServiceOptions('app-server', {
				command: ['node', '/app/applications/service-b/dist/server.js'],
				ingress: (context) => ({
					host: `${context.environment}.${context.application}.row.ovh`
				})
			})
		]
	}

	providers(): AppConfigProviders {
		return { configFiles }
	}
}
