import {
	afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

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
		fetchMock.mock('a', 200).mock('b', 200).spy().catch(404)
			.restore();
		expectToBeStubbed(false);
	});

	it('not call default fetch when in mocked mode', async () => {
		fetchMock.mock('*', 200);

		await globalThis.fetch('http://a.com');
		expect(originalFetch).not.toHaveBeenCalled();
	});
});
