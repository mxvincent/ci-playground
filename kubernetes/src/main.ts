import { ServiceA } from '@charts/service-a'
import { ServiceB } from '@charts/service-b'
import { synthesizeAllResources } from '@libs/argocd'
import { Application, Context, environments } from '@libs/context'

for (const environment of environments) {
	const context = (application: Application) => new Context(application, environment)
	new ServiceA(context('service-a'))
	new ServiceB(context('service-b'))
}

synthesizeAllResources()
