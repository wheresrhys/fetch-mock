import fetchMockModule, { manageFetchMockGlobally } from '../index';
import {
	describe,
	it,
	beforeAll,
	afterAll,
	expect,
	afterEach,
	jest,
} from '@jest/globals';

const fetchMock = fetchMockModule.default;

describe('reset methods', () => {
	describe('new fetch-mock methods', () => {
		afterEach(() => {
			fetchMock.removeRoutes({ includeSticky: true, includeFallback: true });
			fetchMock.clearHistory();
			fetchMock.unmockGlobal();
		});
		it('mockClear() clears history', () => {
			fetchMock.mockGlobal().route('http://a.com', 200);
			fetchMock.fetchHandler('http://a.com');
			expect(fetchMock.callHistory.called()).toBe(true);
			fetchMock.mockClear();
			expect(fetchMock.callHistory.called()).toBe(false);
			expect(fetchMock.router.routes.length).toBe(1);
			expect(fetch).toEqual(fetchMock.fetchHandler);
		});
		it('mockReset() clears history and removes non-sticky routes and fallbacks, but leaves fetch mocked', () => {
			fetchMock
				.mockGlobal()
				.route('http://a.com', 200)
				.route('http://b.com', 200, { sticky: true })
				.catch();
			fetchMock.fetchHandler('http://a.com');
			expect(fetchMock.callHistory.called()).toBe(true);
			expect(fetchMock.router.routes.length).toBe(2);
			expect(fetchMock.router.fallbackRoute).not.toBeUndefined();
			fetchMock.mockReset();
			expect(fetchMock.callHistory.called()).toBe(false);
			expect(fetchMock.router.routes.length).toBe(1);
			expect(fetchMock.router.fallbackRoute).toBeUndefined();
			expect(fetch).toEqual(fetchMock.fetchHandler);
		});
		it('mockReset({ includeSticky: true }) clears history and removes all routes and fallbacks', () => {
			fetchMock
				.mockGlobal()
				.route('http://a.com', 200)

				.route('http://b.com', 200, { sticky: true })
				.catch();
			fetchMock.fetchHandler('http://a.com');
			expect(fetchMock.callHistory.called()).toBe(true);
			expect(fetchMock.router.routes.length).toBe(2);
			expect(fetchMock.router.fallbackRoute).not.toBeUndefined();
			fetchMock.mockReset({ includeSticky: true });
			expect(fetchMock.callHistory.called()).toBe(false);
			expect(fetchMock.router.routes.length).toBe(0);
			expect(fetchMock.router.fallbackRoute).toBeUndefined();
			expect(fetch).toEqual(fetchMock.fetchHandler);
		});
		it('mockRestore() carries out mockReset and unmocks fetch', () => {
			fetchMock
				.mockGlobal()
				.route('http://a.com', 200)
				.route('http://b.com', 200, { sticky: true })
				.catch();
			fetchMock.fetchHandler('http://a.com');
			expect(fetchMock.callHistory.called()).toBe(true);
			expect(fetchMock.router.routes.length).toBe(2);
			expect(fetchMock.router.fallbackRoute).not.toBeUndefined();
			expect(fetch).toEqual(fetchMock.fetchHandler);
			fetchMock.mockRestore();
			expect(fetchMock.callHistory.called()).toBe(false);
			expect(fetchMock.router.routes.length).toBe(1);
			expect(fetchMock.router.fallbackRoute).toBeUndefined();
			expect(fetch).not.toEqual(fetchMock.fetchHandler);
		});
		it('mockRestore({ includeSticky: true }) carries out mockReset({ includeSticky: true }) and unmocks fetch	', () => {
			fetchMock
				.mockGlobal()
				.route('http://a.com', 200)
				.route('http://b.com', 200, { sticky: true })
				.catch();
			fetchMock.fetchHandler('http://a.com');
			expect(fetchMock.callHistory.called()).toBe(true);
			expect(fetchMock.router.routes.length).toBe(2);
			expect(fetchMock.router.fallbackRoute).not.toBeUndefined();
			expect(fetch).toEqual(fetchMock.fetchHandler);
			fetchMock.mockRestore({ includeSticky: true });
			expect(fetchMock.callHistory.called()).toBe(false);
			expect(fetchMock.router.routes.length).toBe(0);
			expect(fetchMock.router.fallbackRoute).toBeUndefined();
			expect(fetch).not.toEqual(fetchMock.fetchHandler);
		});
	});

	describe('manageFetchMockGlobally', () => {
		const originalMethods = {};
		beforeAll(() => {
			// cannot use jest.spyOn as that is part of the functionality we are
			// aiming to test!
			originalMethods.mockClear = fetchMock.mockClear;
			fetchMock.mockClear = jest.fn();
			originalMethods.mockReset = fetchMock.mockReset;
			fetchMock.mockReset = jest.fn();
			originalMethods.mockRestore = fetchMock.mockRestore;
			fetchMock.mockRestore = jest.fn();
		});
		afterEach(() => {
			fetchMock.mockClear.mockClear();
			fetchMock.mockReset.mockClear();
			fetchMock.mockRestore.mockClear();
		});

		afterAll(() => {
			Object.assign(fetchMock, originalMethods);
		});
		it('by default does not hook into jesttest global mock management', () => {
			jest.clearAllMocks();
			expect(fetchMock.mockClear).not.toHaveBeenCalled();
			jest.resetAllMocks();
			expect(fetchMock.mockReset).not.toHaveBeenCalled();
			jest.restoreAllMocks();
			expect(fetchMock.mockRestore).not.toHaveBeenCalled();
		});
		describe('when enabled', () => {
			beforeAll(() => {
				manageFetchMockGlobally(jest);
			});
			it('jest.clearAllMocks() calls .mockClear()', () => {
				jest.clearAllMocks();
				expect(fetchMock.mockClear).toHaveBeenCalled();
				expect(fetchMock.mockReset).not.toHaveBeenCalled();
				expect(fetchMock.mockRestore).not.toHaveBeenCalled();
			});
			it('jest.resetAllMocks() calls .mockReset()', () => {
				jest.resetAllMocks();
				expect(fetchMock.mockClear).not.toHaveBeenCalled();
				expect(fetchMock.mockReset).toHaveBeenCalled();
				expect(fetchMock.mockRestore).not.toHaveBeenCalled();
			});
			it('jest.restoreAllMocks() calls .mockRestore()', () => {
				jest.restoreAllMocks();
				expect(fetchMock.mockClear).not.toHaveBeenCalled();
				expect(fetchMock.mockReset).not.toHaveBeenCalled();
				expect(fetchMock.mockRestore).toHaveBeenCalled();
			});
		});
	});
});
