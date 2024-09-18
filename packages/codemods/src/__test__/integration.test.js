import { it, describe, expect } from 'vitest';
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

function expectCodemodResult(src, expected) {
	expect(transformer({ source: src })).toEqual(expected);
}

describe('integration', () => {

	it('can operate on typescript', async () => {
		const { stdout, stderr } = await exec('jscodeshift -d -t ./packages/codemods/src/index.js ./packages/codemods/src/__test__/fixtures/typescript.ts')
		console.log({ stdout, stderr })
// 		expectCodemodResult(
// 			`import fetchMock from 'fetch-mock';
// function helper (res: number): {
// 	fetchMock.mock("blah", res)
// };`
// 			`import fetchMock from 'fetch-mock';
// function helper (res: number): {
// 	fetchMock.route("blah", res);
// }`,
// 		);
	});
	it('can operate on jsx', () => {
		`import fetchMock from 'fetch-mock';
	fetchMock.mock("blah", <div>Content</div>);`
			`import fetchMock from 'fetch-mock';
	fetchMock.route("blah", <div>Content</div>);`
	});
	it('allow passing in one or more additional variable names for fetch-mock', () => {
		process.env.FM_VARIABLES = 'fm1,fm2';
		expectCodemodResult(
			`const fetchMock = require('fetch-mock');
fetchMock.mock("blah", 200);
fm1.mock("blah", 200);
fm2.mock("blah", 200);`,
			`const fetchMock = require('fetch-mock');
fetchMock.route("blah", 200);
fm1.route("blah", 200);
fm2.route("blah", 200);`,
		);
		delete process.env.FM_VARIABLES
	});
});
