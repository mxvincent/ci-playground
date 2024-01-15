import { JsonObject } from '../types/json'

export type EnvironmentVariableMapping = {
	[key: string]: string | EnvironmentVariableMapping
}

const getEnv = (name: string): string | undefined => process.env[name]

export const getEnvironmentVariables = (mapping: EnvironmentVariableMapping): JsonObject => {
	return Object.entries(mapping)
		.map(([k, v]) => (typeof v === 'string' ? [k, getEnv(v)] : [k, getEnvironmentVariables(v)]))
		.reduce((o, [k, v]) => (v ? Object.assign(o, { [k as string]: v }) : o), {})
}
