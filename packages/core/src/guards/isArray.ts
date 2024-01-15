export const isArray = <T = never>(value: unknown): value is T[] => {
	return Array.isArray(value)
}
