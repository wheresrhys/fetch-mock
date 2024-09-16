import j from 'jscodeshift';
import { simpleOptions } from './codemods/options.js';
import { simpleMethods } from './codemods/methods.js';

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

export function codemod(source) {
	const root = j(source);
	const fetchMockVariableName = findFetchMockVariableName(root);
	simpleMethods(fetchMockVariableName, root);
	// run after simpleMethods because means the options rewriters have to iterate
	// over smaller list of methods
	simpleOptions(fetchMockVariableName, root);

	return root.toSource();
}

export default function transformer(file) {
	return codemod(file.source);
}
