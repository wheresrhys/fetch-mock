import { getAllChainedMethodCalls } from './methods.js';
const simpleOptionNames = ['overwriteRoutes', 'warnOnFallback', 'sendAsJson'];

function appendError(message, path, j) {
	path
		.closest(j.ExpressionStatement)
		.insertAfter(
			j(`throw new Error("${message}")`).find(j.ThrowStatement).get().value,
		);
}
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
	[...simpleOptionNames, 'fallbackToNetwork'].forEach((name) => {
		const propertyAssignments = root.find(j.AssignmentExpression, {
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
		});
		const objectAssignments = configSets.find(j.Property, { key: { name } });

		if (name === 'fallbackToNetwork') {
			const errorMessage =
				'fallbackToNetwork option is deprecated. Use the `spyGlobal()` method instead';
			appendError(errorMessage, propertyAssignments, j);
			appendError(errorMessage, objectAssignments, j);
		}
		propertyAssignments.remove();
		objectAssignments.remove();
	});

	configSets
		.filter((path) => {
			const secondArg = path.value.arguments[1];
			return secondArg.properties.length === 0;
		})
		.remove();

	const fetchMockMethodCalls = getAllChainedMethodCalls(
		fetchMockVariableName,
		root,
		j,
	);

	[
		'once',
		'route',
		'sticky',
		'any',
		'anyOnce',
		'get',
		'getOnce',
		'post',
		'postOnce',
		'put',
		'putOnce',
		'delete',
		'deleteOnce',
		'head',
		'headOnce',
		'patch',
		'patchOnce',
	].some((methodName) => {
		const optionsObjects = fetchMockMethodCalls
			.filter((path) => path.value.callee.property.name === methodName)
			.map((path) => {
				return j(path)
					.find(j.ObjectExpression)
					.filter((path) => {
						return path.value.properties.some(({ key }) =>
							simpleOptionNames.includes(key.name),
						);
					})
					.paths();
			});

		if (!optionsObjects.length) {
			return;
		}
		simpleOptionNames.forEach((optionName) => {
			optionsObjects
				.find(j.Property, {
					key: { name: optionName },
				})
				.remove();
		});
		optionsObjects
			.filter((path) => {
				return path.value.properties.length === 0;
			})
			.remove();
	});
}
