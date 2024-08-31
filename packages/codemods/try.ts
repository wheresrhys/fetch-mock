import { codemod } from './src/index';
import jscodeshift from 'jscodeshift';

codemod(
	`
import fetchMock from 'fetch-mock';
Object.assign(fetchMock.config, {overwriteRoutes: true, other: 'value'})
Object.assign(fetchMock.config, {overwriteRoutes: true})
`,
	jscodeshift,
);
