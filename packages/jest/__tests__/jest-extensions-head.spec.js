/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - head', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala');
		});
		afterAll(() => fetch.reset());
		it('toHaveFetchedHead should be falsy', () => {
			expect(fetch).not.toHaveFetchedHead('http://example.com/path');
		});

		it('toHaveLastFetchedHead should be falsy', () => {
			expect(fetch).not.toHaveLastFetchedHead('http://example.com/path');
		});

		it('toHaveNthFetchedHead should be falsy', () => {
			expect(fetch).not.toHaveNthFetchedHead(1, 'http://example.com/path');
		});

		it('toHaveFetchedHeadTimes should be falsy', () => {
			expect(fetch).not.toHaveFetchedHeadTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHaveFetchedHead', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveFetchedHead('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveFetchedHead('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveFetchedHead('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveFetchedHead('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveFetchedHead('http://example-no.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastFetchedHead', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastFetchedHead('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastFetchedHead('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastFetchedHead('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastFetchedHead('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastFetchedHead('http://example-no.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthFetchedHead', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthFetchedHead(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthFetchedHead(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthFetchedHead(2, 'http://example2.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthFetchedHead(2, 'http://example2.com/path', {
				method: 'head',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthFetchedHead(2, 'http://example-no.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthFetchedHead(1, 'http://example2.com/path');
		});
	});

	describe('toHaveFetchedHeadTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveFetchedHeadTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveFetchedHeadTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveFetchedHeadTimes(2, 'http://example.com/path', {
				method: 'head',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveFetchedHeadTimes(2, 'http://example.com/path', {
				method: 'head',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveFetchedHeadTimes(
				2,
				'http://example-no.com/path',
				{
					method: 'head',
					headers: {
						test: 'header',
					},
				}
			);
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHaveFetchedHeadTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHaveFetchedHeadTimes(3, 'http://example.com/path');
		});
	});
});
