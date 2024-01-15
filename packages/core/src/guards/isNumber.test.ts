import { isNumber } from './isNumber'

test.each([-1, 0, 1, 1.23])('should return true', (value) => {
	expect(isNumber(value)).toBe(true)
})
test.each([undefined, null, false, '123', NaN])('should return false', (value) => {
	expect(isNumber(value)).toBe(false)
})
