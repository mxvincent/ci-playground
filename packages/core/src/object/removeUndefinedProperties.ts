export const removeUndefinedProperties = <T extends Record<string, unknown>>(record: T) => {
	return Object.fromEntries(Object.entries(record).filter((entry) => entry[1] !== undefined))
}
