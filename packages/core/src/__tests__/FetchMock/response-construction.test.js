import { beforeEach, describe, expect, it } from 'vitest';

import fetchMock from '../../FetchMock';

describe('response construction', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	describe('status', () => {
		it('respond with a status', async () => {
			fm.route('*', 300);
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(300);
			expect(res.statusText).toEqual('Multiple Choices');
		});

		it('should error on invalid statuses', async () => {
			fm.route('*', { status: 'not number' });
			try {
				await fm.fetchHandler('http://a.com');
				expect.unreachable('Line above should throw');
			} catch (err) {
				expect(err.message).toMatch(
					/Invalid status not number passed on response object/,
				);
			}
		});
	});

	describe('string', () => {
		it('respond with a string', async () => {
			fm.route('*', 'a string');
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
			expect(res.statusText).toEqual('OK');
			expect(await res.text()).toEqual('a string');
		});

		it('respond with an empty string', async () => {
			fm.route('*', '');
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
			expect(res.statusText).toEqual('OK');
			expect(await res.text()).toEqual('');
		});
	});

	describe('json', () => {
		it('respond with a json', async () => {
			fm.route('*', { an: 'object' });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
			expect(res.statusText).toEqual('OK');
			expect(res.headers.get('content-type')).toEqual('application/json');
			expect(await res.json()).toEqual({ an: 'object' });
		});

		it('convert body properties to json', async () => {
			fm.route('*', {
				body: { an: 'object' },
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).toEqual('application/json');
			expect(await res.json()).toEqual({ an: 'object' });
		});

		it('not overide existing content-type-header', async () => {
			fm.route('*', {
				body: { an: 'object' },
				headers: {
					'content-type': 'text/html',
				},
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).toEqual('text/html');
			expect(await res.json()).toEqual({ an: 'object' });
		});

		it('not convert if `body` property exists', async () => {
			fm.route('*', { body: 'exists' });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).not.toEqual('application/json');
		});

		it('not convert if `headers` property exists', async () => {
			fm.route('*', { headers: {} });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).toBeNull();
		});

		it('not convert if `status` property exists', async () => {
			fm.route('*', { status: 300 });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).toBeNull();
		});

		it('convert if non-whitelisted property exists', async () => {
			fm.route('*', { status: 300, weird: true });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).toEqual('application/json');
		});

		describe('sendAsJson option', () => {
			it('convert object responses to json by default', async () => {
				fm.route('*', { an: 'object' });
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-type')).toEqual('application/json');
			});

			it("don't convert when configured false", async () => {
				fm.config.sendAsJson = false;
				fm.route('*', { an: 'object' });
				const res = await fm.fetchHandler('http://it.at.there');
				// can't check for existence as the spec says, in the browser, that
				// a default value should be set
				expect(res.headers.get('content-type')).not.toEqual('application/json');
			});

			it('local setting can override to true', async () => {
				fm.config.sendAsJson = false;
				fm.route('*', { an: 'object' }, { sendAsJson: true });
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-type')).toEqual('application/json');
			});

			it('local setting can override to false', async () => {
				fm.config.sendAsJson = true;
				fm.route('*', { an: 'object' }, { sendAsJson: false });
				const res = await fm.fetchHandler('http://it.at.there');
				// can't check for existence as the spec says, in the browser, that
				// a default value should be set
				expect(res.headers.get('content-type')).not.toEqual('application/json');
			});
		});
	});

	it('respond with a complex response, including headers', async () => {
		fm.route('*', {
			status: 202,
			body: { an: 'object' },
			headers: {
				header: 'val',
			},
		});
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(202);
		expect(res.headers.get('header')).toEqual('val');
		expect(await res.json()).toEqual({ an: 'object' });
	});

	if (typeof Buffer !== 'undefined') {
		it('can respond with a buffer', () => {
			fm.route(/a/, new Buffer('buffer'), { sendAsJson: false });
			return fm
				.fetchHandler('http://a.com')
				.then((res) => res.text())
				.then((txt) => {
					expect(txt).to.equal('buffer');
				});
		});
	}

	it('respond with blob', async () => {
		const blob = new Blob();
		fm.route('*', blob, { sendAsJson: false });
		const res = await fm.fetchHandler('http://a.com');
		expect(res.status).to.equal(200);
		const blobData = await res.blob();
		expect(blobData).to.eql(blob);
	});

	it('should set the url property on responses', async () => {
		fm.route('begin:http://foo.com', 200);
		const res = await fm.fetchHandler('http://foo.com/path?query=string');
		expect(res.url).toEqual('http://foo.com/path?query=string');
	});

	it('should set the url property on responses when called with a Request object', async () => {
		fm.route('begin:http://foo.com', 200);
		const res = await fm.fetchHandler(
			new Request('http://foo.com/path?query=string'),
		);
		expect(res.url).toEqual('http://foo.com/path?query=string');
	});
	it('respond with a redirected response', async () => {
		fm.route('*', {
			redirectUrl: 'http://b.com',
			body: 'I am a redirect',
		});
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.redirected).toEqual(true);
		expect(res.url).toEqual('http://b.com');
		expect(await res.text()).toEqual('I am a redirect');
	});

	it('construct a response based on the request', async () => {
		fm.route('*', ({ url, options }) => url + options.headers.header);
		const res = await fm.fetchHandler('http://a.com/', {
			headers: { header: 'val' },
		});
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('http://a.com/val');
	});

	it('construct a response based on a Request instance', async () => {
		fm.route('*', ({ request }) => request.json().then(({ a }) => a));
		const res = await fm.fetchHandler(
			new fm.config.Request('http://a.com', {
				body: JSON.stringify({ a: 'b' }),
				method: 'post',
			}),
		);
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('b');
	});

	describe('content-length', () => {
		it('should work on body of type string', async () => {
			fm.route('*', 'content');
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-length')).toEqual('7');
		});

		it('should work on body of type object', async () => {
			fm.route('*', { hello: 'world' });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-length')).toEqual('17');
		});

		it('should not overrule explicit mocked content-length header', async () => {
			fm.route('*', {
				body: {
					hello: 'world',
				},
				headers: {
					'Content-Length': '100',
				},
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-length')).toEqual('100');
		});

		it('should be case-insensitive when checking for explicit content-length header', async () => {
			fm.route('*', {
				body: {
					hello: 'world',
				},
				headers: {
					'CoNtEnT-LeNgTh': '100',
				},
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-length')).toEqual('100');
		});

		describe('includeContentLength option', () => {
			let fm;
			beforeEach(() => {
				fm = fetchMock.createInstance();
			});
			it('include content-length header by default', async () => {
				fm.route('*', 'content');
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-length')).toEqual('7');
			});

			it("don't include when configured false", async () => {
				fm.config.includeContentLength = false;
				fm.route('*', 'content');
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-length')).toBeNull();
			});

			it('local setting can override to true', async () => {
				fm.config.includeContentLength = false;
				fm.route('*', 'content', { includeContentLength: true });
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-length')).toEqual('7');
			});

			it('local setting can override to false', async () => {
				fm.config.includeContentLength = true;
				fm.route('*', 'content', { includeContentLength: false });
				const res = await fm.fetchHandler('http://it.at.there');
				expect(res.headers.get('content-length')).toBeNull();
			});
		});
	});
});
