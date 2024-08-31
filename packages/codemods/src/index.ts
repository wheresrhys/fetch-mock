import type {
	JSCodeshift,
	MemberExpression,
	Identifier,
	FileInfo,
	API,
} from 'jscodeshift';
export function codemod(source: string, j: JSCodeshift) {
	const root = j(source);
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
			console.log(fetchMockVariableName);
		} catch (err) {
			console.log(err);
		}
	}

	const configSets = root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: 'Object',
				},
				property: { name: 'assign' },
			},
		})
		.filter((path) => {
			const firstArg = path.value.arguments[0];
			const secondArg = path.value.arguments[1];
			return (
				firstArg.type === 'MemberExpression' &&
				firstArg.property.name === 'config' &&
				firstArg.object.type === 'Identifier' &&
				firstArg.object.name === fetchMockVariableName &&
				secondArg.type === 'ObjectExpression'
			);
		});
	['overwriteRoutes', 'warnOnFallback', 'sendAsJson'].forEach((name) => {
		root
			.find(j.AssignmentExpression, {
				left: {
					type: 'MemberExpression',
					property: { name },
					object: {
						type: 'MemberExpression',
						property: { name: 'config' },
						object: {
							type: 'Identifier',
							name: fetchMockVariableName,
						},
					},
				},
			})
			.remove();
		configSets.find(j.Property, { key: { name } }).remove();
	});

	configSets
		.filter((path) => {
			const secondArg = path.value.arguments[1];
			return secondArg.properties.length === 0;
		})
		.remove();

	const fetchMockMethodCalls = root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
			},
		})
		.map((path) => {
			const paths = [path];
			while (path.parentPath.value.type !== 'ExpressionStatement') {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		});

	fetchMockMethodCalls.forEach((path) => {
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
