/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - put', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala');
		});
		afterAll(() => fetch.reset());
		it('toHavePut should be falsy', () => {
			expect(fetch).not.toHavePut('http://example.com/path');
		});

		it('toHaveLastPut should be falsy', () => {
			expect(fetch).not.toHaveLastPut('http://example.com/path');
		});

		it('toHaveNthPut should be falsy', () => {
			expect(fetch).not.toHaveNthPut(1, 'http://example.com/path');
		});

		it('toHavePutTimes should be falsy', () => {
			expect(fetch).not.toHavePutTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHavePut', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePut('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePut('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePut('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePut('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePut('http://example-no.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastPut', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastPut('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastPut('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastPut('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastPut('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastPut('http://example-no.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthPut', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthPut(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthPut(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthPut(2, 'http://example2.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthPut(2, 'http://example2.com/path', {
				method: 'put',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthPut(2, 'http://example-no.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthPut(1, 'http://example2.com/path');
		});
	});

	describe('toHavePutTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePutTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePutTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePutTimes(2, 'http://example.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePutTimes(2, 'http://example.com/path', {
				method: 'put',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePutTimes(2, 'http://example-no.com/path', {
				method: 'put',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHavePutTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHavePutTimes(3, 'http://example.com/path');
		});
	});
});
