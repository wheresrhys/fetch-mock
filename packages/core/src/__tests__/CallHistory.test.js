import { beforeEach, describe, expect, it, vi } from 'vitest';

import fetchMock from '../FetchMock';

describe('CallHistory', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	const fetchTheseUrls = (...urls) =>
		Promise.all(urls.map(fm.fetchHandler.bind(fm)));

	describe('helper methods', () => {
		describe('called()', () => {
			it('returns a suitable boolean', () => {
				fm.catch();
				expect(fm.callHistory.called()).toBe(false);
				fm.fetchHandler('http://a.com');
				expect(fm.callHistory.called()).toBe(true);
			});

			it('passes filters through to calls()', () => {
				fm.catch();
				vi.spyOn(fm.callHistory, 'calls');
				fm.fetchHandler('http://a.com');
				expect(fm.callHistory.called('http://a.com')).toBe(true);
				expect(fm.callHistory.calls).toHaveBeenCalledWith(
					'http://a.com',
					undefined,
				);
				expect(fm.callHistory.called('http://b.com')).toBe(false);
				expect(fm.callHistory.calls).toHaveBeenCalledWith(
					'http://b.com',
					undefined,
				);
				expect(fm.callHistory.called('http://a.com', { method: 'get' })).toBe(
					true,
				);
				expect(fm.callHistory.calls).toHaveBeenCalledWith('http://a.com', {
					method: 'get',
				});
				expect(fm.callHistory.called('http://a.com', { method: 'post' })).toBe(
					false,
				);
				expect(fm.callHistory.calls).toHaveBeenCalledWith('http://a.com', {
					method: 'post',
				});
			});
		});
		describe('lastCall()', () => {
			it('returns the call log for the last call', () => {
				fm.catch();
				fm.fetchHandler('http://a.com');
				fm.fetchHandler('http://b.com');
				expect(fm.callHistory.lastCall().url).toEqual('http://b.com/');
			});
			it('passes filters through to calls()', () => {
				fm.catch();
				vi.spyOn(fm.callHistory, 'calls');
				fm.fetchHandler('http://a.com');
				expect(fm.callHistory.lastCall('http://a.com').url).toEqual(
					'http://a.com/',
				);
				expect(fm.callHistory.calls).toHaveBeenCalledWith(
					'http://a.com',
					undefined,
				);
				expect(fm.callHistory.lastCall('http://b.com')).toBe(undefined);
				expect(fm.callHistory.calls).toHaveBeenCalledWith(
					'http://b.com',
					undefined,
				);
				expect(
					fm.callHistory.lastCall('http://a.com', { method: 'get' }).url,
				).toEqual('http://a.com/');
				expect(fm.callHistory.calls).toHaveBeenCalledWith('http://a.com', {
					method: 'get',
				});
				expect(
					fm.callHistory.lastCall('http://a.com', { method: 'post' }),
				).toBe(undefined);
				expect(fm.callHistory.calls).toHaveBeenCalledWith('http://a.com', {
					method: 'post',
				});
			});
		});

		describe('calls()', () => {
			it('retrieves all calls by default', async () => {
				fm.route('http://a.com/', 200).catch();

				await fetchTheseUrls('http://a.com/', 'http://b.com/');
				expect(fm.callHistory.calls().length).toEqual(2);
			});

			it('retrieves calls in correct order', () => {
				fm.catch();

				fm.fetchHandler('http://a.com/');
				fm.fetchHandler('http://b.com/');
				fm.fetchHandler('http://c.com/');
				expect(fm.callHistory.calls()[0].url).toEqual('http://a.com/');
				expect(fm.callHistory.calls()[1].url).toEqual('http://b.com/');
				expect(fm.callHistory.calls()[2].url).toEqual('http://c.com/');
			});

			describe('returned values', () => {
				it('returns call log objects', async () => {
					fm.catch();

					await fm.fetchHandler('http://a.com/', { method: 'get' });

					expect(fm.callHistory.calls()[0]).toEqual(
						expect.objectContaining({
							url: 'http://a.com/',
							options: { method: 'get' },
						}),
					);
				});

				it('when called with Request instance', () => {
					fm.catch();
					const req = new Request('http://a.com/', {
						method: 'post',
					});
					fm.fetchHandler(req);
					expect(fm.callHistory.calls()[0]).toEqual(
						expect.objectContaining({
							url: 'http://a.com/',
							options: expect.objectContaining({ method: 'POST' }),
							request: req,
						}),
					);
				});
				it('when called with Request instance and arbitrary option', () => {
					fm.catch();
					const req = new Request('http://a.com/', {
						method: 'POST',
					});
					fm.fetchHandler(req, { arbitraryOption: true });
					expect(fm.callHistory.calls()[0]).toEqual(
						expect.objectContaining({
							url: 'http://a.com/',
							options: expect.objectContaining({
								method: 'POST',
								arbitraryOption: true,
							}),
							request: req,
						}),
					);
				});
				// Not sure why this was in the old test suite
				it.skip('Not make default signal available in options when called with Request instance using signal', () => {
					fm.catch();
					const req = new Request('http://a.com/', {
						method: 'POST',
					});
					fm.fetchHandler(req);
					console.log(fm.callHistory.calls()[0]);
					expect(fm.callHistory.calls()[0].signal).toBeUndefined();
				});

				describe('retrieving responses', () => {
					it('exposes responses', async () => {
						fm.once('*', 200).once('*', 201);

						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.calls()[0].response.status).toEqual(200);
						expect(fm.callHistory.calls()[1].response.status).toEqual(201);
					});

					it('exposes Responses', async () => {
						fm.once('*', new fm.config.Response('blah'));

						await fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.calls()[0].response.status).toEqual(200);
						await expect(
							fm.callHistory.calls()[0].response.text(),
						).resolves.toEqual('blah');
					});

					// functionality deliberately not implemented yet
					it.skip('has readable response when response already read if using lastResponse', async () => {
						const respBody = { foo: 'bar' };
						fm.once('*', { status: 200, body: respBody }).once('*', 201, {
							overwriteRoutes: false,
						});

						const resp = await fm.fetchHandler('http://a.com/');

						await resp.json();
						expect(await fm.lastResponse().json()).toEqual(respBody);
					});
				});
			});

			describe('filters', () => {
				const expectSingleUrl =
					(...filter) =>
					(url) => {
						const filteredCalls = fm.callHistory.calls(...filter);
						expect(filteredCalls.length).toEqual(1);
						expect(filteredCalls[0].url).toEqual(url);
					};

				describe('boolean and named route filters', () => {
					it('can retrieve calls matched by non-fallback routes', async () => {
						fm.route('http://a.com/', 200).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl(true)('http://a.com/');
						expectSingleUrl('matched')('http://a.com/');
					});

					it('can retrieve calls matched by the fallback route', async () => {
						fm.route('http://a.com/', 200).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl(false)('http://b.com/');
						expectSingleUrl('unmatched')('http://b.com/');
					});

					it('can retrieve only calls handled by a named route', async () => {
						fm.route('http://a.com/', 200, { name: 'a' }).catch();

						await fetchTheseUrls('http://a.com/', 'http://b.com/');
						expectSingleUrl('a')('http://a.com/');
					});
				});

				describe('filtering with a matcher', () => {
					//TODO write a test that just makes it clear this is contracted out to Route
					// spy on route constructor, and then on matcher for that route
					it('should be able to filter with a url matcher', async () => {
						fm.catch();
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/');
						expectSingleUrl('begin:http://a')('http://a.com/');
					});
					it('should be able to filter with a method', async () => {
						fm.catch();
						await fm.fetchHandler('http://a.com/', { method: 'get' });
						await fm.fetchHandler('http://b.com/', { method: 'post' });
						expectSingleUrl({ method: 'GET' })('http://a.com/');
					});
					it('should be able to filter with headers', async () => {
						fm.catch();
						await fm.fetchHandler('http://a.com/', { headers: { a: 'val' } });
						await fm.fetchHandler('http://b.com/', { headers: { b: 'val' } });
						expectSingleUrl({ headers: { a: 'val' } })('http://a.com/');
					});
					it('should be able to combine with options object', async () => {
						fm.catch();
						await fm.fetchHandler('http://a.com/', { headers: { a: 'val' } });
						await fm.fetchHandler('http://a.com/', { headers: { b: 'val' } });
						await fm.fetchHandler('http://b.com/', { headers: { b: 'val' } });
						expectSingleUrl('http://a.com/', { headers: { a: 'val' } })(
							'http://a.com/',
						);
					});
				});

				describe('filtering with options', () => {
					it('can retrieve all calls', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						const filteredCalls = fm.callHistory.calls(undefined, {
							headers: { a: 'z' },
						});
						expect(filteredCalls.length).toEqual(2);
						filteredCalls.forEach(({ options }) =>
							expect(options.headers.a).toEqual('z'),
						);
					});

					it('can retrieve calls matched by non-fallback routes', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						const filteredCalls = fm.callHistory.calls(true, {
							headers: { a: 'z' },
						});
						expect(filteredCalls.length).toEqual(1);
						expect(filteredCalls[0]).toMatchObject(
							expect.objectContaining({
								url: 'http://a.com/',
								options: {
									headers: { a: 'z' },
								},
							}),
						);
					});

					it('can retrieve calls matched by the fallback route', async () => {
						fm.route('http://a.com/', 200).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						await fm.fetchHandler('http://b.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://b.com/');
						const filteredCalls = fm.callHistory.calls(false, {
							headers: { a: 'z' },
						});
						expect(filteredCalls.length).toEqual(1);
						expect(filteredCalls[0]).toMatchObject(
							expect.objectContaining({
								url: 'http://b.com/',
								options: {
									headers: { a: 'z' },
								},
							}),
						);
					});

					it('can retrieve only calls handled by a named route', async () => {
						fm.route('http://a.com/', 200, { name: 'here' }).catch();

						await fm.fetchHandler('http://a.com/', {
							headers: { a: 'z' },
						});
						await fm.fetchHandler('http://a.com/');
						const filteredCalls = fm.callHistory.calls('here', {
							headers: { a: 'z' },
						});
						expect(filteredCalls.length).toEqual(1);
						expect(filteredCalls[0]).toMatchObject(
							expect.objectContaining({
								url: 'http://a.com/',
								options: {
									headers: { a: 'z' },
								},
							}),
						);
					});
				});
			});

			describe('done()', () => {
				let fm;

				it('clearHistory() resets count done-ness', async () => {
					fm = fetchMock.createInstance().route('http://a.com/', 200);
					await fm.fetchHandler('http://a.com/');
					expect(fm.callHistory.done()).toBe(true);
					fm.clearHistory();
					expect(fm.callHistory.done()).toBe(false);
					await fm.fetchHandler('http://a.com/');
					expect(fm.callHistory.done()).toBe(true);
				});

				describe('where number of expected calls is not specified', () => {
					beforeEach(() => {
						fm = fetchMock.createInstance();
						// Note that the c route is unnamed, mainly for verifying that the presence of unnamed routtes does not lead to errors
						fm.route('http://a.com/', 200, 'a')
							.route('http://b.com/', 200, 'b')
							.route('http://c.com/', 200);
					});

					it('can expect at least one call to have been made to every defined route', () => {
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://b.com/');
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://c.com/');
						expect(fm.callHistory.done()).toBe(true);
					});

					it('can expect a named route to be called at least once', () => {
						expect(fm.callHistory.done('a')).toBe(false);
						expect(fm.callHistory.done('b')).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done('a')).toBe(true);
						expect(fm.callHistory.done('b')).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done('a')).toBe(true);
						expect(fm.callHistory.done('b')).toBe(false);
					});

					it('can expect multiple named routes to be called at least once each', () => {
						expect(fm.callHistory.done(['a', 'b'])).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done(['a', 'b'])).toBe(false);
						fm.fetchHandler('http://b.com/');
						expect(fm.callHistory.done(['a', 'b'])).toBe(true);
					});
				});
				describe('where number of expected calls is specified', () => {
					beforeEach(() => {
						fm = fetchMock.createInstance();
						// Note that the c route is unnamed, mainly for verifying that the presence of unnamed routtes does not lead to errors
						fm.route('http://a.com/', 200, { name: 'a', repeat: 2 })
							.route('http://b.com/', 200, { name: 'b', repeat: 1 })
							.route('http://c.com/', 200, { repeat: 2 });
					});

					it('can expect a named route to be called specified number of times', () => {
						expect(fm.callHistory.done('a')).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done('a')).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done('a')).toBe(true);
					});

					it('can expect multiple named routes to be called specified number of times', () => {
						expect(fm.callHistory.done(['a', 'b'])).toBe(false);
						fm.fetchHandler('http://a.com/');
						fm.fetchHandler('http://b.com/');
						expect(fm.callHistory.done(['a', 'b'])).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done(['a', 'b'])).toBe(true);
					});

					it('can expect specific number of calls to have been made to every defined route', () => {
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://a.com/');
						fm.fetchHandler('http://b.com/');
						fm.fetchHandler('http://c.com/');
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://c.com/');
						expect(fm.callHistory.done()).toBe(true);
					});

					it('can combine with routes where specific number of calls is unspecified', () => {
						fm.removeRoutes();
						fm.clearHistory();
						fm.route('http://a.com/', 200, { name: 'a', repeat: 2 })
							.route('http://b.com/', 200, { name: 'b' })
							.route('http://c.com/', 200);

						expect(fm.callHistory.done()).toBe(false);
						fm.fetchHandler('http://a.com/');
						fm.fetchHandler('http://b.com/');
						fm.fetchHandler('http://c.com/');
						expect(fm.callHistory.done()).toBe(false);
						expect(fm.callHistory.done(['a', 'b'])).toBe(false);
						fm.fetchHandler('http://a.com/');
						expect(fm.callHistory.done()).toBe(true);
						expect(fm.callHistory.done(['a', 'b'])).toBe(true);
					});
				});
			});
		});
	});
});
