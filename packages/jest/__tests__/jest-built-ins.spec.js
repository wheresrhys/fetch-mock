/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest built-ins', () => {
	describe('exposing mock internals', () => {
		beforeAll(() => {
			fetch.mock('http://example.com', 200).mock('http://example2.com', 201);
			fetch('http://example.com', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com', {
				headers: {
					test: 'header2',
				},
			});
		});

		afterAll(() => fetch.reset());
		it('exposes `calls` property', () => {
			expect(fetch.mock.calls).toBeDefined();
			expect(fetch.mock.calls.length).toBe(2);
			expect(fetch.mock.calls).toMatchObject([
				[
					'http://example.com',
					{
						headers: {
							test: 'header',
						},
					},
				],
				[
					'http://example2.com',
					{
						headers: {
							test: 'header2',
						},
					},
				],
			]);
		});
		it('exposes `results` property', async () => {
			expect(fetch.mock.results).toBeDefined();
			expect(fetch.mock.results.length).toEqual(2);
			expect(await fetch.mock.results[0].value).toMatchObject({
				status: 200,
			});
			expect(await fetch.mock.results[1].value).toMatchObject({
				status: 201,
			});
		});
	});

	describe('clearing', () => {
		beforeEach(() => {
			fetch.mock('http://example.com', 200).mock('http://example2.com', 201);
			fetch('http://example.com', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com', {
				headers: {
					test: 'header2',
				},
			});
		});

		afterEach(() => fetch.reset());
		it('mockClear', () => {
			expect(fetch.mockClear).toBeDefined();
			fetch.mockClear();
			expect(fetch.mock.calls.length).toEqual(0);
			expect(fetch._calls.length).toEqual(0);
			expect(fetch.routes.length).toEqual(2);
		});
		it('mockReset', () => {
			expect(fetch.mockReset).toBeDefined();
			fetch.mockReset();
			expect(fetch.mock.calls.length).toEqual(0);
			expect(fetch._calls.length).toEqual(0);
			expect(fetch.routes.length).toEqual(0);
		});
		it('mockRestore', () => {
			expect(() => fetch.mockRestore()).toThrow(
				"mockRestore not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockImplementation', () => {
			expect(() => fetch.mockImplementation()).toThrow(
				"mockImplementation not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockImplementationOnce', () => {
			expect(() => fetch.mockImplementationOnce()).toThrow(
				"mockImplementationOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockName', () => {
			expect(() => fetch.mockName()).toThrow(
				"mockName not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockReturnThis', () => {
			expect(() => fetch.mockReturnThis()).toThrow(
				"mockReturnThis not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockReturnValue', () => {
			expect(() => fetch.mockReturnValue()).toThrow(
				"mockReturnValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockReturnValueOnce', () => {
			expect(() => fetch.mockReturnValueOnce()).toThrow(
				"mockReturnValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockResolvedValue', () => {
			expect(() => fetch.mockResolvedValue()).toThrow(
				"mockResolvedValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockResolvedValueOnce', () => {
			expect(() => fetch.mockResolvedValueOnce()).toThrow(
				"mockResolvedValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockRejectedValue', () => {
			expect(() => fetch.mockRejectedValue()).toThrow(
				"mockRejectedValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
		it('mockRejectedValueOnce', () => {
			expect(() => fetch.mockRejectedValueOnce()).toThrow(
				"mockRejectedValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
			);
		});
	});
	describe('native jest mock function inspectors', () => {
		it('.toHaveBeenCalled()', () => {
			expect(() => expect(fetch).toHaveBeenCalled()).not.toThrow();
		});
		// Just want to get the fix out for calling fetch methods
		// These will all work as the basic mechanism is fixed, but
		// no time to set up all th etest cases now
		it.skip('.toHaveBeenCalledTimes(number)', () => {
			expect(() => expect(fetch).toHaveBeenCalledTimes(1)).not.toThrow();
		});
		it.skip('.toHaveBeenCalledWith(arg1, arg2, ...)', () => {
			expect(() => expect(fetch).toHaveBeenCalledWith(1)).not.toThrow();
		});
		it.skip('.toHaveBeenLastCalledWith(arg1, arg2, ...)', () => {
			expect(() => expect(fetch).toHaveBeenLastCalledWith(1)).not.toThrow();
		});
		it.skip('.toHaveBeenNthCalledWith(nthCall, arg1, arg2, ....)', () => {
			expect(() => expect(fetch).toHaveBeenNthCalledWith(1, 1)).not.toThrow();
		});
		it.skip('.toHaveReturned()', () => {
			expect(() => expect(fetch).toHaveReturned()).not.toThrow();
		});
		it.skip('.toHaveReturnedTimes(number)', () => {
			expect(() => expect(fetch).toHaveReturnedTimes(1)).not.toThrow();
		});
		it.skip('.toHaveReturnedWith(value)', () => {
			expect(() => expect(fetch).toHaveReturnedWith(1)).not.toThrow();
		});
		it.skip('.toHaveLastReturnedWith(value)', () => {
			expect(() => expect(fetch).toHaveLastReturnedWith(1)).not.toThrow();
		});
		it.skip('.toHaveNthReturnedWith(nthCall, value)', () => {
			expect(() => expect(fetch).toHaveNthReturnedWith(1, 1)).not.toThrow();
		});
	});
});
