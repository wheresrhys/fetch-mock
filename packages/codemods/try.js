import { codemod } from './src/index.js';
import jscodeshift from 'jscodeshift';

console.log(
	codemod(
		`
import fetchMock from 'fetch-mock';
Object.assign(fetchMock.config, {fallbackToNetwork: true})
`,
		jscodeshift,
	),
);
