import { isString } from './isString'

test.each(['string', '', '123'])('should return true', (value) => {
	expect(isString(value)).toBe(true)
})

test.each([undefined, null, false, 123, new Date(), {}])('should return false', (value) => {
	expect(isString(value)).toBe(false)
})
