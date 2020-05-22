const { expect } = require('chai');
const { fetchMock } = testGlobals;

describe('response generation', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	describe('status', () => {
		it('respond with a status', async () => {
			fm.mock('*', 300);
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).to.equal(300);
			expect(res.statusText).to.equal('Multiple Choices');
		});

		it('should error on invalid statuses', async () => {
			fm.mock('*', { status: 'not number' });
			try {
				await fm.fetchHandler('http://a.com');
				expect(true).to.be.false;
			} catch (err) {
				expect(err.message).to.match(
					/Invalid status not number passed on response object/
				);
			}
		});
	});

	describe('string', () => {
		it('respond with a string', async () => {
			fm.mock('*', 'a string');
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).to.equal(200);
			expect(res.statusText).to.equal('OK');
			expect(await res.text()).to.equal('a string');
		});

		it('respond with an empty string', async () => {
			fm.mock('*', '');
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).to.equal(200);
			expect(res.statusText).to.equal('OK');
			expect(await res.text()).to.equal('');
		});
	});

	describe('json', () => {
		it('respond with a json', async () => {
			fm.mock('*', { an: 'object' });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).to.equal(200);
			expect(res.statusText).to.equal('OK');
			expect(res.headers.get('content-type')).to.equal('application/json');
			expect(await res.json()).to.eql({ an: 'object' });
		});

		it('convert body properties to json', async () => {
			fm.mock('*', {
				body: { an: 'object' },
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).to.equal('application/json');
			expect(await res.json()).to.eql({ an: 'object' });
		});

		it('not overide existing content-type-header', async () => {
			fm.mock('*', {
				body: { an: 'object' },
				headers: {
					'content-type': 'text/html',
				},
			});
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).to.equal('text/html');
			expect(await res.json()).to.eql({ an: 'object' });
		});

		it('not convert if `body` property exists', async () => {
			fm.mock('*', { body: 'exists' });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).not.to.equal('application/json');
		});

		it('not convert if `headers` property exists', async () => {
			fm.mock('*', { headers: {} });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).not.to.exist;
		});

		it('not convert if `status` property exists', async () => {
			fm.mock('*', { status: 300 });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).not.to.exist;
		});

		// in the browser the fetch spec disallows invoking res.headers on an
		// object that inherits from a response, thus breaking the ability to
		// read headers of a fake redirected response.
		if (typeof window === 'undefined') {
			it('not convert if `redirectUrl` property exists', async () => {
				fm.mock('*', {
					redirectUrl: 'http://url.to.hit',
				});
				const res = await fm.fetchHandler('http://a.com/');
				expect(res.headers.get('content-type')).not.to.exist;
			});
		}

		it('convert if non-whitelisted property exists', async () => {
			fm.mock('*', { status: 300, weird: true });
			const res = await fm.fetchHandler('http://a.com/');
			expect(res.headers.get('content-type')).to.equal('application/json');
		});
	});

	it('respond with a complex response, including headers', async () => {
		fm.mock('*', {
			status: 202,
			body: { an: 'object' },
			headers: {
				header: 'val',
			},
		});
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).to.equal(202);
		expect(res.headers.get('header')).to.equal('val');
		expect(await res.json()).to.eql({ an: 'object' });
	});

	// The fetch spec does not allow for manual url setting
	// However node-fetch does, so we only run this test on the server
	if (typeof window === 'undefined') {
		it('should set the url property on responses', async () => {
			fm.mock('begin:http://foo.com', 200);
			const res = await fm.fetchHandler('http://foo.com/path?query=string');
			expect(res.url).to.equal('http://foo.com/path?query=string');
		});

		it('should set the url property on responses when called with Request', async () => {
			fm.mock('begin:http://foo.com', 200);
			const res = await fm.fetchHandler(
				new fm.config.Request('http://foo.com/path?query=string')
			);
			expect(res.url).to.equal('http://foo.com/path?query=string');
		});
	}

	it('respond with a redirected response', async () => {
		fm.mock('*', {
			redirectUrl: 'http://b.com',
			body: 'I am a redirect',
		});
		const res = await fm.fetchHandler('http://a.com/');
		expect(res.redirected).to.equal(true);
		expect(res.url).to.equal('http://b.com');
		expect(await res.text()).to.equal('I am a redirect');
	});

	it('construct a response based on the request', async () => {
		fm.mock('*', (url, opts) => url + opts.headers.header);
		const res = await fm.fetchHandler('http://a.com/', {
			headers: { header: 'val' },
		});
		expect(res.status).to.equal(200);
		expect(await res.text()).to.equal('http://a.com/val');
	});

	it('construct a response based on a Request instance', async () => {
		fm.mock('*', (url, opts, request) => request.json().then(({ a }) => a));
		const res = await fm.fetchHandler(
			new fm.config.Request('http://a.com', {
				body: JSON.stringify({ a: 'b' }),
				method: 'post',
			})
		);
		expect(res.status).to.equal(200);
		expect(await res.text()).to.equal('b');
	});

	describe('content-length', () => {
		it('should work on body of type string', async () => {
			fm.mock('*', 'content');
			const res = await fetch('http://a.com/');
			expect(res.headers.get('content-length')).to.equal('7');
		});

		it('should work on body of type object', async () => {
			fm.mock('*', { hello: 'world' });
			const res = await fetch('http://a.com/');
			expect(res.headers.get('content-length')).to.equal('17');
		});

		it('should not overrule explicit mocked content-length header', async () => {
			fm.mock('*', {
				body: {
					hello: 'world',
				},
				headers: {
					'Content-Length': '100',
				},
			});
			const res = await fetch('http://a.com/');
			expect(res.headers.get('content-length')).to.equal('100');
		});

		it('should be case-insensitive when checking for explicit content-length header', async () => {
			fm.mock('*', {
				body: {
					hello: 'world',
				},
				headers: {
					'CoNtEnT-LeNgTh': '100',
				},
			});
			const res = await fetch('http://a.com/');
			expect(res.headers.get('content-length')).to.equal('100');
		});
	});
});
