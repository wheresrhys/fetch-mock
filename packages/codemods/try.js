import { codemod } from './src/index.js';
import jscodeshift from 'jscodeshift';

console.log(
	codemod(
		`
const fetchMock = require('fetch-mock');
jest.mock('node-fetch', () => fetchMock.fetchHandler)
`,
		jscodeshift,
	),
);
