import { randomFillSync } from 'node:crypto'

const POOL_SIZE_MULTIPLIER = 128

let pool: Buffer
let poolOffset: number

const fillPool = (bytes: number) => {
	if (!pool || pool.length < bytes) {
		pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
		randomFillSync(pool)
		poolOffset = 0
	} else if (poolOffset + bytes > pool.length) {
		randomFillSync(pool)
		poolOffset = 0
	}
	poolOffset += bytes
}

const random = (bytes: number) => {
	fillPool((bytes -= 0))
	return pool.subarray(poolOffset - bytes, poolOffset)
}

const customRandom = (alphabet: string, defaultSize: number, getRandom: (bytesLength: number) => Buffer) => {
	const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
	const step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)
	return (size = defaultSize) => {
		let id = ''
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const bytes = getRandom(step)
			let i = step
			while (i--) {
				id += alphabet[bytes[i] & mask] || ''
				if (id.length === size) return id
			}
		}
	}
}

export const randomString = (alphabet: string, size: number) => customRandom(alphabet, size, random)
