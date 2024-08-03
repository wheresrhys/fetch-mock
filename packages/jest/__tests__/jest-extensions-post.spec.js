/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - post', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala');
		});
		afterAll(() => fetch.reset());
		it('toHavePosted should be falsy', () => {
			expect(fetch).not.toHavePosted('http://example.com/path');
		});

		it('toHaveLastPosted should be falsy', () => {
			expect(fetch).not.toHaveLastPosted('http://example.com/path');
		});

		it('toHaveNthPosted should be falsy', () => {
			expect(fetch).not.toHaveNthPosted(1, 'http://example.com/path');
		});

		it('toHavePostedTimes should be falsy', () => {
			expect(fetch).not.toHavePostedTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHavePosted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePosted('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePosted('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePosted('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePosted('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePosted('http://example-no.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastPosted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastPosted('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastPosted('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastPosted('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastPosted('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastPosted('http://example-no.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthPosted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthPosted(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthPosted(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthPosted(2, 'http://example2.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthPosted(2, 'http://example2.com/path', {
				method: 'post',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthPosted(2, 'http://example-no.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthPosted(1, 'http://example2.com/path');
		});
	});

	describe('toHavePostedTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePostedTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePostedTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePostedTimes(2, 'http://example.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePostedTimes(2, 'http://example.com/path', {
				method: 'post',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePostedTimes(2, 'http://example-no.com/path', {
				method: 'post',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHavePostedTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHavePostedTimes(3, 'http://example.com/path');
		});
	});
});
