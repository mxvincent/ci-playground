import * as core from '@actions/core'
import * as fs from 'node:fs'

export const listApplications = (): string[] => {
	const applicationsDir = core.getInput('applications-directory', { required: true })
	return fs.readdirSync(applicationsDir)
}

export const getPublishedPackages = (): { name: string; version: string }[] => {
	return JSON.parse(core.getInput('published-packages', { required: true }))
}
