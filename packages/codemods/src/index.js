const j = require( 'jscodeshift');
const { simpleOptions } = require( './codemods/options.js');
const { simpleMethods } = require( './codemods/methods.js');

function findFetchMockVariableName(root) {
	let fetchMockVariableName;
	try {
		fetchMockVariableName = root
			.find(j.CallExpression, {
				callee: {
					name: 'require',
				},
				arguments: [{ value: 'fetch-mock' }],
			})
			.closest(j.VariableDeclarator)
			.get().value.id.name;
	} catch {
		try {
			fetchMockVariableName = root
				.find(j.ImportDeclaration, {
					source: { value: 'fetch-mock' },
				})
				.find(j.ImportDefaultSpecifier)
				.get().value.local.name;
		} catch (err) {
			throw new Error('No fetch-mock references found', err);
		}
	}
	return fetchMockVariableName;
}

function codemod(source, variableName) {
	const root = j(source);
	const fetchMockVariableName = variableName || findFetchMockVariableName(root);
	simpleMethods(fetchMockVariableName, root);
	// run after simpleMethods because means the options rewriters have to iterate
	// over smaller list of methods
	simpleOptions(fetchMockVariableName, root);

	return root.toSource();
}

function transformer(file, api) {
	let modifiedSource = codemod(file.source);
	if (process.env.FM_VARIABLES) {
		const extraVariables = process.env.FM_VARIABLES.split(',');
		extraVariables.forEach((variableName) => {
			modifiedSource = codemod(modifiedSource, variableName);
		});
	}
	return modifiedSource;
}

module.exports = transformer;
module.exports.codemod = codemod;
