import { simpleOptions } from './codemods/options.js';
import { simpleMethods } from './codemods/methods.js';

function findFetchMockVariableName(root, j) {
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

export function codemod(source, j) {
	const root = j(source);
	const fetchMockVariableName = findFetchMockVariableName(root, j);
	simpleOptions(fetchMockVariableName, root, j);
	simpleMethods(fetchMockVariableName, root, j);
	return root.toSource();
}

export default function transformer(file, api) {
	return codemod(file.source, api.j);
}
