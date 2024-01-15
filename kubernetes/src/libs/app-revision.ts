import { Application, Environment } from '@libs/context'
import { recursiveDirname } from '@libs/misc'
import { readFileSync } from 'node:fs'

export const APPLICATIONS_DIRECTORY = `${recursiveDirname(3, __dirname)}/applications`

export type DeploymentPlan = Array<{
	application: string
	tags: {
		main: string
		next: string
	}
}>

let deploymentPlan: DeploymentPlan
export const getDeploymentPlan = (): DeploymentPlan => {
	if (!deploymentPlan) {
		const input = process.env.DEPLOYMENT_PLAN
		deploymentPlan = input ? JSON.parse(input) : []
	}
	return deploymentPlan
}

/**
 * Get revision tag (used to tag docker image) from deployment plan
 * @see getDeploymentPlan()
 */
const getRevisionTagFromPlan = (application: Application, environment: Environment) => {
	const target = getDeploymentPlan().find((target) => target.application === application)
	if (target) {
		return environment === 'development' ? target.tags.next : target.tags.main
	}
}

/**
 * Get last release number from application `package.json`
 */
const getLastReleaseVersion = (application: Application): string => {
	const packageJsonPath = `${APPLICATIONS_DIRECTORY}/${application}/package.json`
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
	if (packageJson?.version) {
		return packageJson.version
	}
	throw new Error(`Failed to load revision from ${packageJsonPath}`)
}

/**
 * Get target revision for an application
 */
export const getRevision = (application: Application, environment: Environment) => {
	const tag = getRevisionTagFromPlan(application, environment)
	if (tag) {
		return tag
	}
	return getLastReleaseVersion(application)
}
