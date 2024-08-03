/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - get', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala', { method: 'post' });
		});
		afterAll(() => fetch.reset());
		it('toHaveGot should be falsy', () => {
			expect(fetch).not.toHaveGot('http://example.com/path');
		});

		it('toHaveLastGot should be falsy', () => {
			expect(fetch).not.toHaveLastGot('http://example.com/path');
		});

		it('toHaveNthGot should be falsy', () => {
			expect(fetch).not.toHaveNthGot(1, 'http://example.com/path');
		});

		it('toHaveGotTimes should be falsy', () => {
			expect(fetch).not.toHaveGotTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHaveGot', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveGot('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveGot('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveGot('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveGot('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveGot('http://example-no.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastGot', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastGot('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastGot('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastGot('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastGot('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastGot('http://example-no.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthGot', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthGot(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthGot(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthGot(2, 'http://example2.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthGot(2, 'http://example2.com/path', {
				method: 'get',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthGot(2, 'http://example-no.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthGot(1, 'http://example2.com/path');
		});
	});

	describe('toHaveGotTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveGotTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveGotTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveGotTimes(2, 'http://example.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveGotTimes(2, 'http://example.com/path', {
				method: 'get',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveGotTimes(2, 'http://example-no.com/path', {
				method: 'get',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHaveGotTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHaveGotTimes(3, 'http://example.com/path');
		});
	});
});
