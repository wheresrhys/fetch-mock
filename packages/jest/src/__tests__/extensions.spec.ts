import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import fetchMock from '../index';
import { expectTypeOf } from 'expect-type';

const humanVerbToMethods = [
	{ humanVerb: 'Fetched', method: 'get' },
	{ humanVerb: 'Got', method: 'get' },
	{ humanVerb: 'Posted', method: 'post' },
	{ humanVerb: 'Put', method: 'put' },
	{ humanVerb: 'Deleted', method: 'delete' },
	{ humanVerb: 'FetchedHead', method: 'head' },
	{ humanVerb: 'Patched', method: 'patch' },
] as const;

// initialize a mock here so fetch is patched across all tests
fetchMock.mockGlobal();

describe.each([
	['patched fetch input', fetch],
	['fetchMock input', fetchMock],
])('expect extensions %s', (_str, expectInput) => {
	humanVerbToMethods.forEach(({ humanVerb, method }) => {
		describe(`${humanVerb} expectations`, () => {
			describe('when no calls', () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200, 'my-route');
				});
				afterAll(() => fetchMock.mockReset());
				it(`toHave${humanVerb} should be falsy`, () => {
					expect(expectInput).not[`toHave${humanVerb}`]();
					expect(expectInput).not[`toHave${humanVerb}`](
						'http://example.com/path',
					);
				});

				it(`toHaveLast${humanVerb} should be falsy`, () => {
					expect(expectInput).not[`toHaveLast${humanVerb}`]();
					expect(expectInput).not[`toHaveLast${humanVerb}`](
						'http://example.com/path',
					);
				});

				it(`toHaveNth${humanVerb} should be falsy`, () => {
					expect(expectInput).not[`toHaveNth${humanVerb}`](1);
					expect(expectInput).not[`toHaveNth${humanVerb}`](
						1,
						'http://example.com/path',
					);
				});

				it(`toHave${humanVerb}Times should be falsy`, () => {
					expect(expectInput).not[`toHave${humanVerb}Times`](1);
					expect(expectInput).not[`toHave${humanVerb}Times`](
						1,
						'http://example.com/path',
					);
				});
			});
			describe(`toHave${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path2', {
						method,
						headers: {
							test: 'header',
						},
					});
					fetch('http://example.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches without any matcher supplied', () => {
					expect(expectInput)[`toHave${humanVerb}`]();
				});

				it('matches with just url', () => {
					expect(expectInput)[`toHave${humanVerb}`]('http://example.com/path');
				});

				it('matches with fetch-mock matcher', () => {
					expect(expectInput)[`toHave${humanVerb}`](
						'begin:http://example.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(expectInput)[`toHave${humanVerb}`]('http://example.com/path', {
						headers: {
							test: 'header',
						},
					});
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(expectInput).not[`toHave${humanVerb}`](
						'http://example.com/path',
						{
							headers: {
								test: 'not-header',
							},
						},
					);
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(expectInput).not[`toHave${humanVerb}`](
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it('should not be any', () => {
					expectTypeOf(expect(expectInput)[`toHave${humanVerb}`]).not.toBeAny();
					expectTypeOf(
						expect(expectInput).not[`toHave${humanVerb}`],
					).not.toBeAny();
				});
			});
			describe(`toHaveLast${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches without any matcher supplied', () => {
					expect(expectInput)[`toHaveLast${humanVerb}`]();
				});

				it('matches with just url', () => {
					expect(expectInput)[`toHaveLast${humanVerb}`](
						'http://example.com/path',
					);
				});

				it('matches with fetch-mock matcher', () => {
					expect(expectInput)[`toHaveLast${humanVerb}`](
						'begin:http://example.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(expectInput)[`toHaveLast${humanVerb}`](
						'http://example.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(expectInput).not[`toHaveLast${humanVerb}`](
						'http://example.com/path',
						{
							headers: {
								test: 'not-header',
							},
						},
					);
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(expectInput).not[`toHaveLast${humanVerb}`](
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it('should not be any', () => {
					expectTypeOf(
						expect(expectInput)[`toHaveLast${humanVerb}`],
					).not.toBeAny();
					expectTypeOf(
						expect(expectInput).not[`toHaveLast${humanVerb}`],
					).not.toBeAny();
				});
			});

			describe(`toHaveNth${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example1.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
					fetch('http://example2.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches without any matcher supplied', () => {
					expect(expectInput)[`toHaveNth${humanVerb}`](2);
				});

				it('matches with just url', () => {
					expect(expectInput)[`toHaveNth${humanVerb}`](
						2,
						'http://example2.com/path',
					);
				});

				it('matches with fetch-mock matcher', () => {
					expect(expectInput)[`toHaveNth${humanVerb}`](
						2,
						'begin:http://example2.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(expectInput)[`toHaveNth${humanVerb}`](
						2,
						'http://example2.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(expectInput).not[`toHaveNth${humanVerb}`](
						2,
						'http://example2.com/path',
						{
							headers: {
								test: 'not-header',
							},
						},
					);
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(expectInput).not[`toHaveNth${humanVerb}`](
						2,
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it("doesn't match if wrong n", () => {
					expect(expectInput).not[`toHaveNth${humanVerb}`](
						1,
						'http://example2.com/path',
					);
				});

				it('should not be any', () => {
					expectTypeOf(
						expect(expectInput)[`toHaveNth${humanVerb}`],
					).not.toBeAny();
					expectTypeOf(
						expect(expectInput).not[`toHaveNth${humanVerb}`],
					).not.toBeAny();
				});
			});

			describe(`toHave${humanVerb}Times`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
					fetch('http://example.com/path', {
						method,
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches without any matcher supplied', () => {
					expect(expectInput)[`toHave${humanVerb}Times`](2);
				});

				it('matches with just url', () => {
					expect(expectInput)[`toHave${humanVerb}Times`](
						2,
						'http://example.com/path',
					);
				});

				it('matches with fetch-mock matcher', () => {
					expect(expectInput)[`toHave${humanVerb}Times`](
						2,
						'begin:http://example.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(expectInput)[`toHave${humanVerb}Times`](
						2,
						'http://example.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(expectInput).not[`toHave${humanVerb}Times`](
						2,
						'http://example.com/path',
						{
							headers: {
								test: 'not-header',
							},
						},
					);
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(expectInput).not[`toHave${humanVerb}Times`](
						2,
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});

				it("doesn't match if too few calls", () => {
					expect(expectInput).not[`toHave${humanVerb}Times`](
						1,
						'http://example.com/path',
					);
				});

				it("doesn't match if too many calls", () => {
					expect(expectInput).not[`toHave${humanVerb}Times`](
						3,
						'http://example.com/path',
					);
				});

				it('should not be any', () => {
					expectTypeOf(
						expect(expectInput)[`toHave${humanVerb}Times`],
					).not.toBeAny();
					expectTypeOf(
						expect(expectInput).not[`toHave${humanVerb}Times`],
					).not.toBeAny();
				});
			});
		});
	});
	describe('toBeDone', () => {
		beforeAll(() => {
			fetchMock
				.mockGlobal()
				.once('http://example.com/path', 200, 'route1')
				.route('http://example2.com/path', 200, { name: 'route2', repeat: 2 });
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetchMock.mockReset());
		// it('toBeDone should be falsy only if routes defined', () => {
		// 	expect(expectInput).not.toBeDone();
		// 	expect(expectInput).not.toBeDone('my-route');
		// });
		it('matches with just url', () => {
			expect(expectInput).toBeDone('route1');
		});

		it("doesn't match if too few calls", () => {
			expect(expectInput).not.toBeDone('route2');
		});

		it('should not be any', () => {
			expectTypeOf(expect(expectInput).toBeDone).not.toBeAny();
			expectTypeOf(expect(expectInput).not.toBeDone).not.toBeAny();
		});
	});
});

describe('expect extensions: bad inputs', () => {
	humanVerbToMethods.forEach(({ humanVerb }) => {
		it(`${humanVerb} - throws an error if we the input is not patched with fetchMock`, () => {
			expect(() => {
				// This simulates a "fetch" implementation that doesn't have fetchMock
				expect({})[`toHave${humanVerb}`]('http://example.com/path');
			}).toThrow(
				'Unable to get fetchMock instance!  Please make sure you passed a patched fetch or fetchMock!',
			);
		});
	});
});
