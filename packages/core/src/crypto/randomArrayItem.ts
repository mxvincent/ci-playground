export const randomArrayItem = <T = unknown>(array: Array<T> | ReadonlyArray<T>): T => {
	const index = Math.floor(Math.random() * array.length)
	return array[index]
}
