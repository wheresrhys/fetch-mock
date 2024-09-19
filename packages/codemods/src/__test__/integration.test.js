import { it, describe, expect } from 'vitest';
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

describe('integration', () => {
	it('can operate on typescript', async () => {
		const { stdout } = await exec(
			'jscodeshift --parser ts -p -d -t ./packages/codemods/src/index.js ./packages/codemods/src/__test__/fixtures/typescript.ts',
		);
		expect(stdout).toContain(`import fetchMock from 'fetch-mock';
function helper (res: number): void {
	fetchMock.route("blah", res);
}`);
	});
	it('can operate on jsx', async () => {
		const { stdout } = await exec(
			'jscodeshift --parser ts -p -d -t ./packages/codemods/src/index.js ./packages/codemods/src/__test__/fixtures/jsx.jsx',
		);
		expect(stdout).toContain(`import fetchMock from 'fetch-mock';
fetchMock.route("blah", <div>Content</div>);`);
	});

	it('can operate on tsx', async () => {
		const { stdout } = await exec(
			'jscodeshift --parser ts -p -d -t ./packages/codemods/src/index.js ./packages/codemods/src/__test__/fixtures/tsx.tsx',
		);
		expect(stdout).toContain(`import fetchMock from 'fetch-mock';
function helper (res: number): void {
	fetchMock.route("blah", <div>Content</div>);
}`);
	});
	it('allow passing in one or more additional variable names for fetch-mock', async () => {
		const { stdout } = await exec(
			'FM_VARIABLES=fm1,fm2 jscodeshift --parser ts -p -d -t ./packages/codemods/src/index.js ./packages/codemods/src/__test__/fixtures/extra-vars.js',
		);
		expect(stdout).toContain(`const fetchMock = require('fetch-mock');
fetchMock.route('blah', 200);
fm1.route('blah', 200);
fm2.route('blah', 200);`);
	});
});
