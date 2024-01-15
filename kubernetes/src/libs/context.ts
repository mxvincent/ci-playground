import { getRevision } from '@libs/app-revision'

export const applications = ['service-a', 'service-b'] as const
export type Application = (typeof applications)[number]

export const environments = ['development', 'production', 'staging'] as const
export type Environment = (typeof environments)[number]

export class Context {
	readonly application: Application
	readonly environment: Environment
	readonly revision: string
	readonly image: string
	readonly namespace: string

	constructor(application: Application, environment: Environment, revision?: string) {
		this.application = application
		this.environment = environment
		this.revision = revision ?? getRevision(application, environment)
		this.image = `ghcr.io/mxvincent/${application}:${this.revision}`
		this.namespace = `${environment}-${application}`
	}
}
