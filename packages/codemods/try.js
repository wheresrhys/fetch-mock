const { codemod } = require('./src/index.js');

console.log(
	codemod(
		`const fetchMock = require('fetch-mock');
fetchMock.get('*', 200, {overwriteRoutes: true});
`,
	),
);
