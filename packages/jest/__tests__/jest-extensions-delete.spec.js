/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions - delete', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://lala');
		});
		afterAll(() => fetch.reset());
		it('toHaveDeleted should be falsy', () => {
			expect(fetch).not.toHaveDeleted('http://example.com/path');
		});

		it('toHaveLastDeleted should be falsy', () => {
			expect(fetch).not.toHaveLastDeleted('http://example.com/path');
		});

		it('toHaveNthDeleted should be falsy', () => {
			expect(fetch).not.toHaveNthDeleted(1, 'http://example.com/path');
		});

		it('toHaveDeletedTimes should be falsy', () => {
			expect(fetch).not.toHaveDeletedTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHaveDeleted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveDeleted('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveDeleted('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveDeleted('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveDeleted('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveDeleted('http://example-no.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastDeleted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastDeleted('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastDeleted('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastDeleted('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastDeleted('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastDeleted('http://example-no.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthDeleted', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthDeleted(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthDeleted(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthDeleted(2, 'http://example2.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthDeleted(2, 'http://example2.com/path', {
				method: 'delete',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthDeleted(2, 'http://example-no.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthDeleted(1, 'http://example2.com/path');
		});
	});

	describe('toHaveDeletedTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveDeletedTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveDeletedTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveDeletedTimes(2, 'http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveDeletedTimes(2, 'http://example.com/path', {
				method: 'delete',
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveDeletedTimes(2, 'http://example-no.com/path', {
				method: 'delete',
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHaveDeletedTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHaveDeletedTimes(3, 'http://example.com/path');
		});
	});
});
