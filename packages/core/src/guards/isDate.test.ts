import { isDate } from './isDate'

test('should return true', () => {
	expect(isDate(new Date())).toBe(true)
})

test.each([undefined, null, false, '123', 123, { k: 'v' }])('should return false', (value) => {
	expect(isDate(value)).toBe(false)
})
