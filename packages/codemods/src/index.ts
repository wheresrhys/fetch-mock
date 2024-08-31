import type {
	JSCodeshift,
	MemberExpression,
	Identifier,
	FileInfo,
	API,
} from 'jscodeshift';
export function codemod(source: string, j: JSCodeshift) {
	const root = j(source);
	const fetchMockVariableName = root
		.find(j.CallExpression, {
			callee: {
				name: 'require',
			},
			arguments: [{ value: 'fetch-mock' }],
		})
		.closest(j.VariableDeclarator)
		.get().value.id.name;

	const usesOfFetchmock = root.find(j.CallExpression, {
		callee: {
			object: {
				type: 'Identifier',
				name: fetchMockVariableName,
			},
		},
	});

	usesOfFetchmock
		.map((path) => {
			const paths = [path];
			while (path.parentPath.value.type !== 'ExpressionStatement') {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		})
		.forEach((path) => {
			const callee = path.value.callee as MemberExpression;
			const property = callee.property as Identifier;
			const method = property.name;
			if (method === 'mock') {
				property.name = 'route';
			}
		});

	return root.toSource();
}

export default function transformer(file: FileInfo, api: API): string {
	return codemod(file.source, api.j);
}
