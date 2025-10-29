import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import Route from '../../Route';

describe('url matching', () => {
	it('match exact strings', () => {
		const route = new Route({ url: 'http://a.com/path', response: 200 });
		expect(route.matcher({ url: 'http://a.com/pat' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/paths' })).toBe(false);
		expect(route.matcher({ url: 'http://a.co/path' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/path' })).toBe(true);
	});

	it('match string objects', () => {
		const route = new Route({ url: 'http://a.com/path', response: 200 });
		expect(route.matcher({ url: new String('http://a.com/path') })).toBe(true);
	});

	it('match exact string against URL object', () => {
		const route = new Route({ url: 'http://a.com/path', response: 200 });
		const url = new URL('http://a.com/path');
		expect(route.matcher({ url })).toBe(true);
	});

	it('match using URL object as matcher', () => {
		const url = new URL('http://a.com/path');
		const route = new Route({ url: url, response: 200 });
		expect(route.matcher({ url: 'http://a.com/path' })).toBe(true);
	});

	it('match begin: keyword', () => {
		const route = new Route({
			url: 'begin:http://a.com/path',
			response: 200,
		});

		expect(route.matcher({ url: 'http://b.com/path' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/pat' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/path' })).toBe(true);
		expect(route.matcher({ url: 'http://a.com/paths' })).toBe(true);
	});

	it('match host: keyword', () => {
		const route = new Route({
			url: 'host:a.b.com',
			response: 200,
		});

		expect(route.matcher({ url: 'http://b.com/path' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/path' })).toBe(false);
		expect(route.matcher({ url: 'http://a.b.com/path' })).toBe(true);
		expect(route.matcher({ url: 'https://a.b.com/path' })).toBe(true);
	});

	it('match end: keyword', () => {
		const route = new Route({ url: 'end:com/path', response: 200 });
		expect(route.matcher({ url: 'http://a.com/paths' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/pat' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/path' })).toBe(true);
		expect(route.matcher({ url: 'http://b.com/path' })).toBe(true);
	});

	it('match include: keyword', () => {
		const route = new Route({
			url: 'include:m/p',
			response: 200,
		});

		expect(route.matcher({ url: 'http://a.com/path' })).toBe(true);
		expect(route.matcher({ url: 'http://a.com/ram/path' })).toBe(true);
		expect(route.matcher({ url: 'http://a.com/p' })).toBe(true);
		expect(route.matcher({ url: 'http://a.com/P' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/ramp' })).toBe(false);
	});

	it('match glob: keyword', () => {
		const route = new Route({ url: 'glob:/its/*/*', response: 200 });
		expect(route.matcher({ url: '/its/alive' })).toBe(false);
		expect(route.matcher({ url: '/its/a/boy' })).toBe(true);
		expect(route.matcher({ url: '/its/a/girl' })).toBe(true);
	});

	it('match express: keyword', () => {
		const route = new Route({ url: 'express:/its/:word', response: 200 });

		expect(route.matcher({ url: '/its' })).toBe(false);
		expect(route.matcher({ url: '/its/' })).toBe(false);
		expect(route.matcher({ url: '/its/a/girl' })).toBe(false);
		expect(route.matcher({ url: '/its/alive' })).toBe(true);
	});

	it('match path: keyword', () => {
		const route = new Route({ url: 'path:/its/:word', response: 200 });

		expect(route.matcher({ url: '/its/boy' })).toBe(false);
		expect(route.matcher({ url: '/its/:word/still' })).toBe(false);
		expect(route.matcher({ url: '/its/:word' })).toBe(true);
		expect(route.matcher({ url: '/its/:word?brain=false' })).toBe(true);
	});

	it('match wildcard string', () => {
		const route = new Route({ url: '*', response: 200 });

		expect(route.matcher({ url: 'http://a.com' })).toBe(true);
	});

	it('match regular expressions', () => {
		const rx = /http:\/\/a\.com\/\d+/;
		const route = new Route({ url: rx, response: 200 });

		expect(route.matcher({ url: 'http://a.com/' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/abcde' })).toBe(false);
		expect(route.matcher({ url: 'http://a.com/12345' })).toBe(true);
	});

	it('match with multiple url patterns at once', () => {
		const route = new Route({
			url: {
				begin: 'http',
				end: 'jam',
				path: '/jar/of/jam',
				express: '/:container/of/:stuff',
			},
			response: 200,
		});
		expect(route.matcher({ url: 'http://a.com/jar/of/jam' })).toBe(true);
	});

	describe('data: URLs', () => {
		it('match exact strings', () => {
			const route = new Route({
				url: 'data:text/plain,path',
				response: 200,
			});
			expect(route.matcher({ url: 'data:text/plain,pat' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,paths' })).toBe(false);
			expect(route.matcher({ url: 'data:text/html,path' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,path' })).toBe(true);
		});
		it('match exact string against URL object', () => {
			const route = new Route({
				url: 'data:text/plain,path',
				response: 200,
			});
			const url = new URL('data:text/plain,path');
			expect(route.matcher({ url })).toBe(true);
		});
		it('match using URL object as matcher', () => {
			const url = new URL('data:text/plain,path');
			const route = new Route({ url: url, response: 200 });
			expect(route.matcher({ url: 'data:text/plain,path' })).toBe(true);
		});
		it('match begin: keyword', () => {
			const route = new Route({
				url: 'begin:data:text/plain',
				response: 200,
			});
			expect(route.matcher({ url: 'http://a.com/path' })).toBe(false);
			expect(route.matcher({ url: 'data:text/html,path' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,path' })).toBe(true);
			expect(route.matcher({ url: 'data:text/plain;base64,cGF0aA' })).toBe(
				true,
			);
		});
		it('match end: keyword', () => {
			const route = new Route({ url: 'end:sky', response: 200 });
			expect(route.matcher({ url: 'data:text/plain,blue lake' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,blue sky research' })).toBe(
				false,
			);
			expect(route.matcher({ url: 'data:text/plain,blue sky' })).toBe(true);
			expect(route.matcher({ url: 'data:text/plain,grey sky' })).toBe(true);
		});
		it('match glob: keyword', () => {
			const route = new Route({ url: 'glob:data:* sky', response: 200 });
			expect(route.matcher({ url: 'data:text/plain,blue lake' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,blue sky' })).toBe(true);
			expect(route.matcher({ url: 'data:text/plain,grey sky' })).toBe(true);
		});
		it('match wildcard string', () => {
			const route = new Route({ url: '*', response: 200 });
			expect(route.matcher({ url: 'data:text/plain,path' })).toBe(true);
		});
		it('match regular expressions', () => {
			const rx = /data:text\/plain,\d+/;
			const route = new Route({ url: rx, response: 200 });
			expect(route.matcher({ url: 'data:text/html,12345' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,path' })).toBe(false);
			expect(route.matcher({ url: 'data:text/plain,12345' })).toBe(true);
		});
	});

	describe('url resolution and normalisation', () => {
		describe('trailing slashes', () => {
			it('match exact pathless urls regardless of trailing slash', () => {
				const route = new Route({ url: 'http://a.com/', response: 200 });

				expect(route.matcher({ url: 'http://a.com/' })).toBe(true);
				expect(route.matcher({ url: 'http://a.com' })).toBe(true);

				const route2 = new Route({ url: 'http://b.com', response: 200 });
				expect(route2.matcher({ url: 'http://b.com/' })).toBe(true);
				expect(route2.matcher({ url: 'http://b.com' })).toBe(true);
			});
		});

		describe('protocol agnostic urls', () => {
			it('protocol agnostic url matches protocol agnostic url', () => {
				const route = new Route({ url: '//a.com', response: 200 });
				expect(route.matcher({ url: '//a.com' })).toBe(true);
			});
			it('protocol agnostic url does not match protocol specific url', () => {
				const route = new Route({ url: '//a.com', response: 200 });
				expect(route.matcher({ url: 'http://a.com' })).toBe(false);
			});
			it('protocol specific url does not match protocol agnostic url', () => {
				const route = new Route({ url: 'http://a.com', response: 200 });
				expect(route.matcher({ url: '//a.com' })).toBe(false);
			});
			it('protocol agnostic url matches beginning of protocol agnostic url', () => {
				const route = new Route({ url: 'begin://a.com', response: 200 });
				expect(route.matcher({ url: '//a.com/path' })).toBe(true);
			});
			it('protocol agnostic url does not match beginning of protocol specific url', () => {
				const route = new Route({ url: 'begin://a.com', response: 200 });
				expect(route.matcher({ url: 'http://a.com/path' })).toBe(false);
			});
			it('protocol specific url does not match beginning of protocol agnostic url', () => {
				const route = new Route({ url: 'begin:http://a.com', response: 200 });
				expect(route.matcher({ url: '//a.com/path' })).toBe(false);
			});
		});
		describe('dot segments', () => {
			it('dot segmented url matches dot segmented url', () => {
				const absoluteRoute = new Route({
					url: 'http://it.at/not/../there',
					response: 200,
				});
				expect(
					absoluteRoute.matcher({ url: 'http:///it.at/not/../there' }),
				).toBe(true);
			});
			it('dot segmented url matches dot segmentless url', () => {
				const absoluteRoute = new Route({
					url: 'http://it.at/not/../there',
					response: 200,
				});
				expect(absoluteRoute.matcher({ url: 'http:///it.at/there' })).toBe(
					true,
				);
			});
			it('dot segmentless url matches dot segmented url', () => {
				const absoluteRoute = new Route({
					url: 'http://it.at/there',
					response: 200,
				});
				expect(
					absoluteRoute.matcher({ url: 'http:///it.at/not/../there' }),
				).toBe(true);
			});
			it('dot segmented path matches dot segmented path', () => {
				const relativeRoute = new Route({
					url: 'path:/it.at/not/../there',
					response: 200,
				});
				expect(relativeRoute.matcher({ url: '/it.at/not/../there' })).toBe(
					true,
				);
			});
			it('dot segmented path matches dot segmentless path', () => {
				const relativeRoute = new Route({
					url: 'path:/it.at/not/../there',
					response: 200,
				});
				expect(relativeRoute.matcher({ url: '/it.at/there' })).toBe(true);
			});
			it('dot segmentless path matches dot segmented path', () => {
				const relativeRoute = new Route({
					url: 'path:/it.at/there',
					response: 200,
				});
				expect(relativeRoute.matcher({ url: '/it.at/not/../there' })).toBe(
					true,
				);
			});
		});
		describe('relative urls', () => {
			const isBrowser = Boolean(globalThis.location);
			let JSDOM;
			async function importJSDOM() {
				const jsdomModule = await import('jsdom');
				JSDOM = jsdomModule.JSDOM;
			}
			beforeAll(() => {
				if (!isBrowser) {
					return importJSDOM();
				}
			});

			if (!isBrowser) {
				describe('when not in browser environment', () => {
					it('error on page relative url if not in the browser', () => {
						expect(
							() => new Route({ url: 'image.jpg', response: 200 }),
						).toThrow(
							'Relative urls are not support by default in node.js tests. Either use a utility such as jsdom to define globalThis.location or set `fetchMock.config.allowRelativeUrls = true`',
						);
					});

					it('error on origin relative url if not in the browser', () => {
						expect(
							() => new Route({ url: '/image.jpg', response: 200 }),
						).toThrow(
							'Relative urls are not support by default in node.js tests. Either use a utility such as jsdom to define globalThis.location or set `fetchMock.config.allowRelativeUrls = true`',
						);
					});

					it('not error if jsdom used not in the browser', () => {
						const dom = new JSDOM(``, {
							url: 'https://a.com/path',
						});
						globalThis.location = dom.window.location;
						expect(
							() => new Route({ url: 'image.jpg', response: 200 }),
						).not.toThrow();
						expect(
							() => new Route({ url: '/image.jpg', response: 200 }),
						).not.toThrow();
						delete globalThis.location;
					});

					it('match unqualified host relative urls if "allowRelativeUrls" flag is on', () => {
						const route = new Route({
							url: '/image.jpg',
							response: 200,
							allowRelativeUrls: true,
						});
						expect(route.matcher({ url: '/image.jpg' })).toBe(true);
					});
					it('match unqualified page relative urls if "allowRelativeUrls" flag is on', () => {
						const route = new Route({
							url: 'image.jpg',
							response: 200,
							allowRelativeUrls: true,
						});
						expect(route.matcher({ url: 'image.jpg' })).toBe(true);
					});

					it('not match host: keyword', () => {
						const route = new Route({
							url: 'host:a.com',
							response: 200,
						});

						expect(route.matcher({ url: '/path' })).toBe(false);
					});
				});
			}

			describe('when in browser environment', () => {
				let location;
				let origin;
				let host;
				beforeAll(() => {
					if (!isBrowser) {
						const dom = new JSDOM(``, {
							url: 'https://a.com/path',
						});
						globalThis.location = dom.window.location;
					}
					location = globalThis.location.href;
					origin = globalThis.location.origin;
					host = globalThis.location.host;
				});
				afterAll(() => {
					if (!isBrowser) {
						delete globalThis.location;
					}
				});
				it('page relative url matches page relative url', () => {
					const route = new Route({ url: 'image.jpg', response: 200 });
					expect(route.matcher({ url: 'image.jpg' })).toBe(true);
				});

				it('fully qualified url matches page relative url', () => {
					const route = new Route({
						url: `${location}/image.jpg`,
						response: 200,
					});
					expect(route.matcher({ url: 'image.jpg' })).toBe(true);
				});

				it('page relative url matches fully qualified url', () => {
					const route = new Route({ url: 'image.jpg', response: 200 });
					expect(route.matcher({ url: `${location}/image.jpg` })).toBe(true);
				});

				it('origin relative url matches origin relative url', () => {
					const route = new Route({ url: '/image.jpg', response: 200 });
					expect(route.matcher({ url: '/image.jpg' })).toBe(true);
				});

				it('fully qualified url matches origin relative url', () => {
					const route = new Route({
						url: `${origin}/image.jpg`,
						response: 200,
					});
					expect(route.matcher({ url: '/image.jpg' })).toBe(true);
				});

				it('origin relative url matches fully qualified url', () => {
					const route = new Route({ url: '/image.jpg', response: 200 });
					expect(route.matcher({ url: `${origin}/image.jpg` })).toBe(true);
				});

				it('match host: keyword', () => {
					const route = new Route({
						url: `host:${host}`,
						response: 200,
					});

					expect(route.matcher({ url: '/path' })).toBe(true);
				});
			});
		});
	});
});
