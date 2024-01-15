import { getPackageInfo, getPackageRootPath, logger, serializers } from '@pkg/core'
import { createServer } from 'node:http'

const packageInfo = getPackageInfo({
	packageJsonFilePath: `${getPackageRootPath(__dirname)}/package.json`
})

const server = createServer((req, res) => {
	logger.info(serializers.request(req))
	res.setHeader('Content-Type', 'application/json')
	res.writeHead(200)
	res.end(JSON.stringify(packageInfo))
})

server.listen(4000, '0.0.0.0', () => {
	logger.info(`🚀 Apollo server ready at 0.0.0.0:4000`)
})
