import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import fetchMock from '../index';
describe('expect extensions', () => {
	[
		'Fetched',
		'Got:get',
		'Posted:post',
		'Put:put',
		'Deleted:delete',
		'FetchedHead:head',
		'Patched:patch',
	].forEach((verbs) => {
		const [humanVerb, method] = verbs.split(':');
		describe(`${humanVerb} expectations`, () => {
			describe('when no calls', () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200, 'my-route');
				});
				afterAll(() => fetchMock.mockReset());
				it(`toHave${humanVerb} should be falsy`, () => {
					expect(fetch).not[`toHave${humanVerb}`]('http://example.com/path');
				});

				it(`toHaveLast${humanVerb} should be falsy`, () => {
					expect(fetch).not[`toHaveLast${humanVerb}`](
						'http://example.com/path',
					);
				});

				it(`toHaveNth${humanVerb} should be falsy`, () => {
					expect(fetch).not[`toHaveNth${humanVerb}`](
						1,
						'http://example.com/path',
					);
				});

				it(`toHave${humanVerb}Times should be falsy`, () => {
					expect(fetch).not[`toHave${humanVerb}Times`](
						1,
						'http://example.com/path',
					);
				});
			});
			describe(`toHave${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path2', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
					fetch('http://example.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches with just url', () => {
					expect(fetch)[`toHave${humanVerb}`]('http://example.com/path');
				});

				it('matches with fetch-mock matcher', () => {
					expect(fetch)[`toHave${humanVerb}`]('begin:http://example.com/path');
				});

				it('matches with matcher and options', () => {
					expect(fetch)[`toHave${humanVerb}`]('http://example.com/path', {
						headers: {
							test: 'header',
						},
					});
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(fetch).not[`toHave${humanVerb}`]('http://example.com/path', {
						headers: {
							test: 'not-header',
						},
					});
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(fetch).not[`toHave${humanVerb}`](
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});
			});
			describe(`toHaveLast${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches with just url', () => {
					expect(fetch)[`toHaveLast${humanVerb}`]('http://example.com/path');
				});

				it('matches with fetch-mock matcher', () => {
					expect(fetch)[`toHaveLast${humanVerb}`](
						'begin:http://example.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(fetch)[`toHaveLast${humanVerb}`]('http://example.com/path', {
						headers: {
							test: 'header',
						},
					});
				});

				it("doesn't match if matcher but not options is correct", () => {
					expect(fetch).not[`toHaveLast${humanVerb}`](
						'http://example.com/path',
						{
							headers: {
								test: 'not-header',
							},
						},
					);
				});

				it("doesn't match if options but not matcher is correct", () => {
					expect(fetch).not[`toHaveLast${humanVerb}`](
						'http://example-no.com/path',
						{
							headers: {
								test: 'header',
							},
						},
					);
				});
			});

			describe(`toHaveNth${humanVerb}`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example1.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
					fetch('http://example2.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches with just url', () => {
					expect(fetch)[`toHaveNth${humanVerb}`](2, 'http://example2.com/path');
				});

				it('matches with fetch-mock matcher', () => {
					expect(fetch)[`toHaveNth${humanVerb}`](
						2,
						'begin:http://example2.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(fetch)[`toHaveNth${humanVerb}`](
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
					expect(fetch).not[`toHaveNth${humanVerb}`](
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
					expect(fetch).not[`toHaveNth${humanVerb}`](
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
					expect(fetch).not[`toHaveNth${humanVerb}`](
						1,
						'http://example2.com/path',
					);
				});
			});

			describe(`toHave${humanVerb}Times`, () => {
				beforeAll(() => {
					fetchMock.mockGlobal().route('*', 200);
					fetch('http://example.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
					fetch('http://example.com/path', {
						method: method || 'get',
						headers: {
							test: 'header',
						},
					});
				});
				afterAll(() => fetchMock.mockReset());

				it('matches with just url', () => {
					expect(fetch)[`toHave${humanVerb}Times`](
						2,
						'http://example.com/path',
					);
				});

				it('matches with fetch-mock matcher', () => {
					expect(fetch)[`toHave${humanVerb}Times`](
						2,
						'begin:http://example.com/path',
					);
				});

				it('matches with matcher and options', () => {
					expect(fetch)[`toHave${humanVerb}Times`](
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
					expect(fetch).not[`toHave${humanVerb}Times`](
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
					expect(fetch).not[`toHave${humanVerb}Times`](
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
					expect(fetch).not[`toHave${humanVerb}Times`](
						1,
						'http://example.com/path',
					);
				});

				it("doesn't match if too many calls", () => {
					expect(fetch).not[`toHave${humanVerb}Times`](
						3,
						'http://example.com/path',
					);
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
		// 	expect(fetch).not.toBeDone();
		// 	expect(fetch).not.toBeDone('my-route');
		// });
		it('matches with just url', () => {
			expect(fetch).toBeDone('route1');
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toBeDone('route2');
		});
	});
});
