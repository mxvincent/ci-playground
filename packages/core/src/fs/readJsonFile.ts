import fs from 'node:fs'
import { resolve } from 'node:path'
import { Json } from '../types/json'
import { isReadableFileSync } from './isReadableFile'

/**
 * Get file content as string synchronously
 */
export const readJsonFileSync = <T = Json>(path: string): T => {
	const fullPath = resolve(path)
	if (!isReadableFileSync(fullPath)) {
		throw new Error(`File does not exists or is not readable (path=${fullPath})`)
	}
	const fileContent = fs.readFileSync(fullPath).toString('utf-8')
	return JSON.parse(fileContent)
}
