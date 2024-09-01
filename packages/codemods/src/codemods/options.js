export function simpleOptions(fetchMockVariableName, root, j) {
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
}
