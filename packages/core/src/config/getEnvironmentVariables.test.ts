import { EnvironmentVariableMapping, getEnvironmentVariables } from './getEnvironmentVariables'

describe('loanConfigFromEnvironment()', function () {
	beforeAll(() => {
		Object.assign(process.env, {
			A: 'value',
			B: 'value'
		})
	})
	it.each([
		{ input: {}, output: {} },
		{ input: { a: 'A' }, output: { a: 'value' } },
		{ input: { a: { b: 'B' } }, output: { a: { b: 'value' } } }
	])('should return configuration object %#', ({ input, output }) => {
		expect(getEnvironmentVariables(input as EnvironmentVariableMapping)).toEqual(output)
	})
})
