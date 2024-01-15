import { SerializedError, stdSerializers } from 'pino'

export const serializers: {
	error: (error: Error | unknown) => SerializedError | unknown
	request: typeof stdSerializers.req
	response: typeof stdSerializers.res
} = {
	error: (error: Error | unknown) => {
		if (error instanceof Error) {
			return stdSerializers.err(error)
		}
		return error
	},
	request: stdSerializers.req,
	response: stdSerializers.res
}
