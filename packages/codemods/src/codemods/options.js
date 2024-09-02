import { getAllChainedMethodCalls } from './methods.js';
const simpleOptionNames = ['overwriteRoutes', 'warnOnFallback', 'sendAsJson'];
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
	simpleOptionNames.forEach((name) => {
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
