const baseRules = require('@d-fischer/eslint-config');

const namingConvention = [
	...baseRules.rules['@typescript-eslint/naming-convention'],
	{
		selector: 'function',
		format: ['strictCamelCase', 'StrictPascalCase']
	}
]

module.exports = {
	extends: '@d-fischer',

	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/naming-convention': namingConvention
	}
};
