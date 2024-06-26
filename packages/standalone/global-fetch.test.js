import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchMock } = testGlobals;

describe('use with global fetch', () => {
	let originalFetch;

	const expectToBeStubbed = (yes = true) => {
		expect(globalThis.fetch).toEqual(
			yes ? fetchMock.fetchHandler : originalFetch,
		);
		expect(globalThis.fetch).not.toEqual(
			yes ? originalFetch : fetchMock.fetchHandler,
		);
	};

	beforeEach(() => {
		originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
	});
	afterEach(fetchMock.restore);

	it('replaces global fetch when mock called', () => {
		fetchMock.mock('*', 200);
		expectToBeStubbed();
	});

	it('replaces global fetch when catch called', () => {
		fetchMock.catch(200);
		expectToBeStubbed();
	});

	it('replaces global fetch when spy called', () => {
		fetchMock.spy();
		expectToBeStubbed();
	});

	it('restores global fetch after a mock', () => {
		fetchMock.mock('*', 200).restore();
		expectToBeStubbed(false);
	});

	it('restores global fetch after a complex mock', () => {
		fetchMock.mock('a', 200).mock('b', 200).spy().catch(404).restore();
		expectToBeStubbed(false);
	});

	it('not call default fetch when in mocked mode', async () => {
		fetchMock.mock('*', 200);

		await globalThis.fetch('http://a.com');
		expect(originalFetch).not.toHaveBeenCalled();
	});
});
let originalFetch;

beforeAll(() => {
	originalFetch = globalThis.fetch = vi.fn().mockResolvedValue('dummy');
});

it('return function', () => {
	const sbx = fetchMock.sandbox();
	expect(typeof sbx).toEqual('function');
});



it("don't interfere with global fetch", () => {
	const sbx = fetchMock.sandbox().route('http://a.com', 200);

	expect(globalThis.fetch).toEqual(originalFetch);
	expect(globalThis.fetch).not.toEqual(sbx);
});

it("don't interfere with global fetch-mock", async () => {
	const sbx = fetchMock.sandbox().route('http://a.com', 200).catch(302);

	fetchMock.route('http://b.com', 200).catch(301);

	expect(globalThis.fetch).toEqual(fetchMock.fetchHandler);
	expect(fetchMock.fetchHandler).not.toEqual(sbx);
	expect(fetchMock.fallbackResponse).not.toEqual(sbx.fallbackResponse);
	expect(fetchMock.routes).not.toEqual(sbx.routes);

	const [sandboxed, globally] = await Promise.all([
		sbx('http://a.com'),
		fetch('http://b.com'),
	]);

	expect(sandboxed.status).toEqual(200);
	expect(globally.status).toEqual(200);
	expect(sbx.called('http://a.com')).toBe(true);
	expect(sbx.called('http://b.com')).toBe(false);
	expect(fetchMock.called('http://b.com')).toBe(true);
	expect(fetchMock.called('http://a.com')).toBe(false);
	expect(sbx.called('http://a.com')).toBe(true);
	fetchMock.restore();
});