import { Size } from 'cdk8s'
import { ContainerResources, Cpu } from 'cdk8s-plus-26'
import { dirname } from 'node:path'
import * as process from 'process'

export type RequiredProperties<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] }

export type Options<T, K extends keyof T> = { [P in K]-?: T[P] } & Partial<Omit<T, K>>

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>
	  }
	: T

export const recursiveDirname = (iteration: number, path: string): string => {
	if (iteration === 0) {
		return path
	}
	return recursiveDirname(iteration - 1, dirname(path))
}

export const withProtocol = (protocol: 'http' | 'https') => (url: string) => `${protocol}://${url}`

export const http = withProtocol('http')
export const https = withProtocol('https')

export const env = (variableName: string, defaultValue?: string) => {
	return process.env[variableName] ?? defaultValue
}

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
