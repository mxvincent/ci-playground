import { AppChart } from '@libs/app-chart'
import { AppConfigProviders, ConfigFilesContent, ConfigFilesProvider } from '@libs/app-config'
import { WebServiceOptions } from '@libs/components/web-service'

const configFiles: ConfigFilesProvider = (context) => {
	const content: ConfigFilesContent = new Map()
	content.set('config.json', {
		logLevel: 'info',
		app: {
			baseUrl: `${context.environment}.${context.application}.row.ovh`,
			server: {
				host: '0.0.0.0',
				port: 4000
			}
		}
	})
	return { content }
}
export class ServiceA extends AppChart {
	components() {
		return [
			new WebServiceOptions('app-server', {
				command: ['node', '/app/applications/service-a/dist/server.js'],
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
