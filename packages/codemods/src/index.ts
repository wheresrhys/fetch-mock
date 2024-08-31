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

  const directConfigSets = root.find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        property: {name: 'overwriteRoutes'},
        object: {
          type: 'MemberExpression',
          property: {name: 'config'},
          object: {
            type: 'Identifier',
            name: fetchMockVariableName,
          }
        }
      },
  }).remove();

 const configSets = root
    .find(j.CallExpression, {
      callee: {
        object: {
          type: "Identifier",
          name: "Object"
        },
        property: { name: "assign" }
      }
    })
    .filter((path) => {
      const firstArg = path.value.arguments[0];
      const secondArg = path.value.arguments[1];
      return (
        firstArg.type === "MemberExpression" &&
        firstArg.property.name === "config" &&
        firstArg.object.type === "Identifier" &&
        firstArg.object.name === fetchMockVariableName
      ) && (secondArg.type === 'ObjectExpression'
      && secondArg.properties.some(property => property.key.name === 'overwriteRoutes') );
    })

  configSets.filter((path) => {
    const secondArg = path.value.arguments[1];
    return (secondArg.properties.length === 1)
  }).remove();

  configSets.filter((path) => {
    const secondArg = path.value.arguments[1];
    return (secondArg.properties.length > 1)
  })
  .find(j.Property, { key: { name: "overwriteRoutes" } }).remove()



	const fetchMockMethodCalls = root.find(j.CallExpression, {
		callee: {
			object: {
				type: 'Identifier',
				name: fetchMockVariableName,
			},
		},
	});
  fetchMockMethodCalls
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
