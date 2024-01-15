import pino, { LoggerOptions } from 'pino'

export { Logger } from 'pino'

export enum LogLevel {
	trace = 'trace',
	debug = 'debug',
	info = 'info',
	warn = 'warn',
	error = 'error',
	fatal = 'fatal',
	silent = 'silent'
}

export const getLoggerOptions = (environment = process.env.NODE_ENV): LoggerOptions => {
	// Logger config options
	const options: LoggerOptions = {
		level: LogLevel.info,
		redact: {
			paths: ['[*].headers.authorization']
		}
	}

	// Return logger config for production environment
	if (environment === 'production') {
		return options
	}

	// Enable pino-pretty for non production environments
	options.transport = {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'HH:MM:ss Z',
			ignore: 'pid,hostname'
		}
	}

	// Use `fatal` as default log level for test environment
	if (environment === 'test') {
		options.level = LogLevel.fatal
	}

	return options
}

export const logger = pino(getLoggerOptions())

export const setLogLevel = (level: LogLevel): void => {
	logger.level = level
	logger.silent(`[Logger] Set log level to ${level}`)
}
