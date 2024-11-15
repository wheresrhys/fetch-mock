const j = require('jscodeshift').withParser('tsx');

function getAllChainedMethodCalls(fetchMockVariableName, root) {
	return root
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
			while (
				!['ArrowFunctionExpression', 'ExpressionStatement'].includes(
					path.parentPath.value.type,
				)
			) {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		});
}

module.exports.getAllChainedMethodCalls = getAllChainedMethodCalls;
module.exports.simpleMethods = function (fetchMockVariableName, root) {
	const fetchMockMethodCalls = getAllChainedMethodCalls(
		fetchMockVariableName,
		root,
	);

	fetchMockMethodCalls.forEach((path) => {
		const method = path.value.callee.property.name;
		if (method === 'mock') {
			path.value.callee.property.name = 'route';
		}

		if (method === 'resetHistory') {
			path.value.callee.property.name = 'clearHistory';
		}

		['get', 'post', 'put', 'delete', 'head', 'patch'].some((httpMethod) => {
			let prependStar = false;
			if (method === `${httpMethod}Any`) {
				prependStar = true;
				path.value.callee.property.name = httpMethod;
			} else if (method === `${httpMethod}AnyOnce`) {
				prependStar = true;
				path.value.callee.property.name = `${httpMethod}Once`;
			}
			if (prependStar) {
				path.value.arguments.unshift(j.stringLiteral('*'));
			}
		});
	});
	['reset', 'restore', 'resetBehavior'].forEach((methodName) => {
		root
			.find(j.CallExpression, {
				callee: {
					object: {
						type: 'Identifier',
						name: fetchMockVariableName,
					},
					property: {
						name: methodName,
					},
				},
			})
			.forEach((path) => {
				const sticky = path?.value?.arguments[0]?.properties?.find(
					(prop) => prop.key.name === 'sticky',
				)?.value?.value;
				let expressionsString;
				if (methodName === 'resetBehavior') {
					expressionsString = `
fetchMock.removeRoutes(${sticky ? '{includeSticky: true}' : ''});
fetchMock.unmockGlobal();`;
				} else {
					expressionsString = `
fetchMock.hardReset(${sticky ? '{includeSticky: true}' : ''});`;
				}
				const newExpressions = j(expressionsString)
					.find(j.ExpressionStatement)
					.paths();
				const insertLocation = j(path)
					.closest(j.ExpressionStatement)
					.replaceWith(newExpressions.shift().value);
				while (newExpressions.length) {
					insertLocation.insertAfter(newExpressions.pop().value);
				}
			});
	});

	[
		['lastUrl', 'url'],
		['lastOptions', 'options'],
		['lastResponse', 'response'],
	].forEach(([oldMethod, newProperty]) => {
		root
			.find(j.CallExpression, {
				callee: {
					object: {
						type: 'Identifier',
						name: fetchMockVariableName,
					},
					property: {
						name: oldMethod,
					},
				},
			})
			.closest(j.ExpressionStatement)
			.replaceWith((path) => {
				const oldCall = j(path).find(j.CallExpression).get();
				const builder = j(
					`${fetchMockVariableName}.callHistory.lastCall()?.${newProperty}`,
				);
				const newCall = builder.find(j.CallExpression).get();
				newCall.value.arguments = oldCall.value.arguments;
				return builder.find(j.ExpressionStatement).get().value;
			});
	});

	root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
				property: {
					name: 'lastCall',
				},
			},
		})
		.closest(j.ExpressionStatement)
		.insertBefore(
			j(
				'throw new Error("lastCall() now returns a CallLog object instead of an array. Refer to the documentation")',
			)
				.find(j.ThrowStatement)
				.get().value,
		);

	root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
				property: {
					name: 'calls',
				},
			},
		})
		.closest(j.ExpressionStatement)
		.insertBefore(
			j(
				'throw new Error("calls() now returns an array of CallLog objects instead of an array of arrays. Refer to the documentation")',
			)
				.find(j.ThrowStatement)
				.get().value,
		);
};
