module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'turbo', 'import'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:import/typescript'
	],
	rules: {
		'no-console': 'error',
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'turbo/no-undeclared-env-vars': 'warn',
		'import/no-relative-packages': 'error',
		'import/no-relative-parent-imports': 'warn',
		'import/no-useless-path-segments': 'warn'
	}
}
