export type IngressAnnotations = {
	sslRedirect: boolean
	proxyBodySize: string
	certIssuer: string
}

export type IngressConfig = {
	host: string
	path?: string
	annotations?: Partial<IngressAnnotations>
}
