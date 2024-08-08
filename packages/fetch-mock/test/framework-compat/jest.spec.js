/* global	jest, it, describe, expect */
jest.mock('node-fetch', () =>
	require('../../dist/cjs/index.js').default.sandbox(),
);
const fetchMock = require('../../dist/cjs/index.js').default;
const nodeFetch = require('node-fetch');
describe('compatibility with jest', () => {
	it('works with node-fetch', async () => {
		nodeFetch.mock('*', 200);
		const res = await nodeFetch('askdjhsakd');
		expect(res.status).toEqual(200);
		nodeFetch.restore();
	});

	it('works with native fetch', async () => {
		fetchMock.mock('*', 200);
		const res = await fetch('askdjhsakd');
		expect(res.status).toEqual(200);
		fetchMock.restore();
	});

	it('isolates node-fetch and native fetch use cases', async () => {
		nodeFetch.mock('*', 200);
		fetchMock.mock('*', 201);
		const nodeFetchRes = await nodeFetch('askdjhsakd');
		const nativeFetchRes = await fetch('askdjhsakd');
		expect(nodeFetchRes.status).toEqual(200);
		expect(nativeFetchRes.status).toEqual(201);
		nodeFetch.restore();
		fetchMock.restore();
	});
});
