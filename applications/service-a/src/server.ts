import { getPackageInfo, getPackageRootPath, logger, serializers } from '@pkg/core'
import { createServer } from 'node:http'

const packageInfo = getPackageInfo({
	packageJsonFilePath: `${getPackageRootPath(__dirname)}/package.json`
})

const host = process.env.APP_SERVER_HOST ?? '0.0.0.0'
const port = Number(process.env.APP_SERVER_PORT ?? '4000')

const server = createServer((req, res) => {
	logger.info(serializers.request(req))
	res.setHeader('Content-Type', 'application/json')
	res.writeHead(200)
	res.end(JSON.stringify(packageInfo))
})

server.listen(port, host, () => {
	logger.info(`🚀 HTTP server listening on http://${host}:${port}`)
})
