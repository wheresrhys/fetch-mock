import { codemod } from './src/index.js';
import jscodeshift from 'jscodeshift';

console.log(
	codemod(
		`
import fetchMock from 'fetch-mock';
fetchMock.getAny(200, {name: 'who'})
`,
		jscodeshift,
	),
);
