export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const fetchMockVariableName = root
    .find(j.CallExpression, {
      callee: {
        name: "require"
      },
      arguments: [{ value: "fetch-mock" }]
    })
    .closest(j.VariableDeclarator)
    .get().value.id.name;

  const usesOfFetchmock = root
    .find(j.CallExpression, {
      callee: {
        object: {
          type: "Identifier",
          name: fetchMockVariableName
        }
      }
    })
    .map((path) => {
      const paths = [path];
      while (path.parentPath.value.type !== "ExpressionStatement") {
        path = path.parentPath;
        if (path.value.type === "CallExpression") {
          paths.push(path);
        }
      }
      return paths;
    })
    .forEach((path) => {
      const method = path.value.callee.property.name;
      if (method === "mock") {
        path.value.callee.property.name = "route";
      }
    });

  return root.toSource();
}
