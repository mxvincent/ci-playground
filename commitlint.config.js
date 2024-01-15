module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			['chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']
		],
		'body-max-line-length': [1, 'always', 120],
		'footer-max-line-length': [1, 'always', 120]
	}
}
