/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - patch', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala');
		});
		afterAll(() => fetch.reset());
		it('toHavePatched should be falsy', () => {
			expect(fetch).not.toHavePatched('http://example.com/path');
		});

		it('toHaveLastPatched should be falsy', () => {
			expect(fetch).not.toHaveLastPatched('http://example.com/path');
		});

		it('toHaveNthPatched should be falsy', () => {
			expect(fetch).not.toHaveNthPatched(1, 'http://example.com/path');
		});

		it('toHavePatchedTimes should be falsy', () => {
			expect(fetch).not.toHavePatchedTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHavePatched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePatched('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePatched('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePatched('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePatched('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePatched('http://example-no.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastPatched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastPatched('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastPatched('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastPatched('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastPatched('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastPatched('http://example-no.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthPatched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthPatched(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthPatched(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthPatched(2, 'http://example2.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthPatched(2, 'http://example2.com/path', {
				method: 'patch',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthPatched(2, 'http://example-no.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthPatched(1, 'http://example2.com/path');
		});
	});

	describe('toHavePatchedTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHavePatchedTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHavePatchedTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHavePatchedTimes(2, 'http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHavePatchedTimes(2, 'http://example.com/path', {
				method: 'patch',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHavePatchedTimes(2, 'http://example-no.com/path', {
				method: 'patch',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHavePatchedTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHavePatchedTimes(3, 'http://example.com/path');
		});
	});
});
