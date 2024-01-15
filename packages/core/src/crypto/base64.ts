/**
 *  Encode string as base64
 */
export const base64Encode = (val: string): string => {
	return Buffer.from(val).toString('base64')
}

/**
 * Decode base64 encoded string
 */
export const base64Decode = (val: string): string => {
	return Buffer.from(val, 'base64').toString()
}
