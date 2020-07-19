// cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// consider case where multiple routes match.. make sure only one matcher logs calls
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock } = testGlobals;

describe('inspecting', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	describe('api', () => {
		describe('signatures', () => {
			before(() => {
				fm.mock('http://a.com/', 200).mock('http://b.com/', 200);
				return fm.fetchHandler('http://a.com/', {
					method: 'post',
					arbitraryOption: true,
				});
			});
			after(() => fm.restore());
			it('called() returns boolean', () => {
				expect(fm.called('http://a.com/')).to.be.true;
				expect(fm.called('http://b.com/')).to.be.false;
			});
			it('calls() returns array of calls', () => {
				expect(fm.calls('http://a.com/')).to.eql([
					['http://a.com/', { method: 'post', arbitraryOption: true }],
				]);
				expect(fm.calls('http://b.com/')).to.eql([]);
			});
			it('lastCall() returns array of parameters', () => {
				expect(fm.lastCall('http://a.com/')).to.eql([
					'http://a.com/',
					{ method: 'post', arbitraryOption: true },
				]);
				expect(fm.lastCall('http://b.com/')).to.be.undefined;
			});
			it('lastUrl() returns string', () => {
				expect(fm.lastUrl('http://a.com/')).to.equal('http://a.com/');
				expect(fm.lastUrl('http://b.com/')).to.be.undefined;
			});
			it('lastOptions() returns object', () => {
				expect(fm.lastOptions('http://a.com/')).to.eql({
					method: 'post',
					arbitraryOption: true,
				});
				expect(fm.lastOptions('http://b.com/')).to.be.undefined;
			});
		});
		describe('applying filters', () => {
			beforeEach(() => {
				sinon.stub(fm, 'filterCalls').returns([]);
			});
			afterEach(() => {
				fm.filterCalls.restore();
			});
			['called', 'calls', 'lastCall', 'lastUrl', 'lastOptions'].forEach(
				(method) => {
					it(`${method}() uses the internal filtering method`, () => {
						fm[method]('name', { an: 'option' });
						expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
							.true;
					});
				}
			);
		});
	});

	describe('filtering', () => {
		afterEach(() => fm.reset());

		const fetchUrls = (...urls) => Promise.all(urls.map(fm.fetchHandler));

		const expectFilteredLength = (...filter) => (length) =>
			expect(fm.filterCalls(...filter).length).to.equal(length);

		const expectFilteredUrl = (...filter) => (url) =>
			expect(fm.filterCalls(...filter)[0][0]).to.equal(url);

		const expectSingleUrl = (...filter) => (url) => {
			expectFilteredLength(...filter)(1);
			expectFilteredUrl(...filter)(url);
		};

		const expectFilteredResponse = (...filter) => (...response) =>
			expect(fm.filterCalls(...filter)[0]).to.eql(response);

		it('returns [url, options] pairs', async () => {
			fm.mock('http://a.com/', 200, { name: 'fetch-mock' });

			await fm.fetchHandler('http://a.com/', { method: 'get' });
			expect(fm.filterCalls()[0]).to.eql(['http://a.com/', { method: 'get' }]);
		});

		it('can retrieve all calls', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fetchUrls('http://a.com/', 'http://b.com/');
			expectFilteredLength()(2);
		});

		it('can retrieve only calls matched by any route', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fetchUrls('http://a.com/', 'http://b.com/');
			expectSingleUrl(true)('http://a.com/');
			expectSingleUrl('matched')('http://a.com/');
		});

		it('can retrieve only calls not matched by any route', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fetchUrls('http://a.com/', 'http://b.com/');
			expectSingleUrl(false)('http://b.com/');
			expectSingleUrl('unmatched')('http://b.com/');
		});

		it('can retrieve only calls handled by a named route', async () => {
			fm.mock('http://a.com/', 200, { name: 'a' }).catch();

			await fetchUrls('http://a.com/', 'http://b.com/');
			expectSingleUrl('a')('http://a.com/');
		});

		it('can retrieve only calls handled by matcher', async () => {
			fm.mock('path:/path', 200).catch();

			await fetchUrls('http://a.com/', 'http://b.com/path');
			expectSingleUrl('path:/path')('http://b.com/path');
		});

		it('can retrieve only calls handled by a non-string matcher', async () => {
			const rx = /path/;
			fm.mock(rx, 200).catch();

			await fetchUrls('http://a.com/', 'http://b.com/path');
			expectSingleUrl(rx)('http://b.com/path');
		});

		it('can retrieve only calls which match a previously undeclared matcher', async () => {
			fm.mock('http://a.com/path', 200).catch();

			await fm.fetchHandler('http://a.com/path');
			expectSingleUrl('path:/path')('http://a.com/path');
		});

		context('filtered by method', () => {
			it('can retrieve all calls', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', { method: 'POST' });
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(undefined, 'post')(2);
				expectFilteredLength(undefined, 'POST')(2);
				expect(
					fm
						.filterCalls(undefined, 'POST')
						.filter(([, options]) => options.method.toLowerCase() === 'post')
						.length
				).to.equal(2);
			});

			it('can retrieve only calls matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', { method: 'POST' });
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(true, 'post')(1);
				expectFilteredLength(true, 'POST')(1);
				expectFilteredResponse(true, 'POST')('http://a.com/', {
					method: 'post',
				});
			});

			it('can retrieve only calls not matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', { method: 'POST' });
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(false, 'post')(1);
				expectFilteredLength(false, 'POST')(1);
				expectFilteredResponse(false, 'POST')('http://b.com/', {
					method: 'POST',
				});
			});

			it('can retrieve only calls handled by a named route', async () => {
				fm.mock('http://a.com/', 200, { name: 'a' }).catch();
				fm.mock('http://b.com/', 200, { name: 'b' }).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength('a', 'post')(1);
				expectFilteredLength('a', 'POST')(1);
				expectFilteredLength('b')(1);
				expectFilteredResponse('a', 'POST')('http://a.com/', {
					method: 'post',
				});
			});

			it('can retrieve only calls handled by matcher', async () => {
				fm.mock('path:/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength('path:/path', 'post')(1);
				expectFilteredLength('path:/path', 'POST')(1);
				expectFilteredResponse('path:/path', 'POST')('http://b.com/path', {
					method: 'post',
				});
			});

			it('can retrieve only calls handled by a non-string matcher', async () => {
				const rx = /path/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength(rx, 'post')(1);
				expectFilteredLength(rx, 'POST')(1);
				expectFilteredResponse(rx, 'POST')('http://b.com/path', {
					method: 'post',
				});
			});

			it('can retrieve only calls which match a previously undeclared matcher', async () => {
				fm.mock('http://a.com/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength('path:/path', 'post')(1);
				expectFilteredLength('path:/path', 'POST')(1);
				expectFilteredResponse('path:/path', 'POST')('http://b.com/path', {
					method: 'post',
				});
			});
		});

		context('filtered by options', () => {
			it('can retrieve all calls', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(undefined, { headers: { a: 'z' } })(2);
				expect(
					fm
						.filterCalls(undefined, { headers: { a: 'z' } })
						.filter(([, options]) => options.headers['a']).length
				).to.equal(2);
			});

			it('can retrieve only calls matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(true, { headers: { a: 'z' } })(1);
				expectFilteredResponse(true, { headers: { a: 'z' } })('http://a.com/', {
					headers: { a: 'z' },
				});
			});

			it('can retrieve only calls not matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/');
				expectFilteredLength(false, { headers: { a: 'z' } })(1);
				expectFilteredResponse(false, { headers: { a: 'z' } })(
					'http://b.com/',
					{ headers: { a: 'z' } }
				);
			});

			it('can retrieve only calls handled by a named route', async () => {
				fm.mock('http://a.com/', 200, { name: 'here' }).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://a.com/');
				expectFilteredLength('here', { headers: { a: 'z' } })(1);
				expectFilteredResponse('here', { headers: { a: 'z' } })(
					'http://a.com/',
					{ headers: { a: 'z' } }
				);
			});

			it('can retrieve only calls handled by matcher', async () => {
				fm.mock('path:/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength('path:/path', { headers: { a: 'z' } })(1);
				expectFilteredResponse('path:/path', {
					headers: { a: 'z' },
				})('http://b.com/path', { headers: { a: 'z' } });
			});

			it('can retrieve only calls handled by a non-string matcher', async () => {
				const rx = /path/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength(rx, { headers: { a: 'z' } })(1);
				expectFilteredResponse(rx, { headers: { a: 'z' } })(
					'http://b.com/path',
					{ headers: { a: 'z' } }
				);
			});

			it('can retrieve only calls handled by a body matcher', async () => {
				const bodyMatcher = { body: { a: 1 } };
				fm.mock(bodyMatcher, 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 1 }),
				});
				await fm.fetchHandler('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 2 }),
				});
				expectFilteredLength(true, bodyMatcher)(1);
				expectFilteredResponse(true, bodyMatcher)('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 1 }),
				});
			});

			it('can retrieve only calls handled by a partial body matcher', async () => {
				const bodyMatcher = {
					body: { a: 1 },
					matchPartialBody: true,
				};
				fm.mock(bodyMatcher, 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 1, b: 2 }),
				});
				await fm.fetchHandler('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 2, b: 2 }),
				});
				expectFilteredLength(true, bodyMatcher)(1);
				expectFilteredResponse(true, bodyMatcher)('http://b.com/path', {
					method: 'post',
					body: JSON.stringify({ a: 1, b: 2 }),
				});
			});

			it('can retrieve only calls which match a previously undeclared matcher', async () => {
				fm.mock('http://a.com/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { a: 'z' },
				});
				await fm.fetchHandler('http://b.com/path');
				expectFilteredLength('path:/path', { headers: { a: 'z' } })(1);
				expectFilteredResponse('path:/path', {
					headers: { a: 'z' },
				})('http://b.com/path', { headers: { a: 'z' } });
			});
		});
	});

	describe('call order', () => {
		it('retrieves calls in correct order', async () => {
			fm.mock('http://a.com/', 200).mock('http://b.com/', 200).catch();

			fm.fetchHandler('http://a.com/');
			fm.fetchHandler('http://b.com/');
			fm.fetchHandler('http://b.com/');
			expect(fm.calls()[0][0]).to.equal('http://a.com/');
			expect(fm.calls()[1][0]).to.equal('http://b.com/');
			expect(fm.calls()[2][0]).to.equal('http://b.com/');
			fm.reset();
		});
	});

	describe('retrieving call parameters', () => {
		before(() => {
			fm.mock('http://a.com/', 200);
			fm.fetchHandler('http://a.com/');
			fm.fetchHandler('http://a.com/', { method: 'POST' });
		});
		after(() => fm.restore());

		it('calls (call history)', () => {
			expect(fm.calls()[0]).to.eql(['http://a.com/', undefined]);
			expect(fm.calls()[1]).to.eql(['http://a.com/', { method: 'POST' }]);
		});

		it('lastCall', () => {
			expect(fm.lastCall()).to.eql(['http://a.com/', { method: 'POST' }]);
		});

		it('lastOptions', () => {
			expect(fm.lastOptions()).to.eql({ method: 'POST' });
		});

		it('lastUrl', () => {
			expect(fm.lastUrl()).to.eql('http://a.com/');
		});

		it('when called with Request instance', () => {
			const req = new fm.config.Request('http://a.com/', {
				method: 'POST',
			});
			fm.fetchHandler(req);
			const [url, callOptions] = fm.lastCall();

			expect(url).to.equal('http://a.com/');
			expect(callOptions).to.include({ method: 'POST' });
			expect(fm.lastUrl()).to.equal('http://a.com/');
			const options = fm.lastOptions();
			expect(options).to.include({ method: 'POST' });
			expect(fm.lastCall().request).to.equal(req);
		});

		it('when called with Request instance and arbitrary option', () => {
			const req = new fm.config.Request('http://a.com/', {
				method: 'POST',
			});
			fm.fetchHandler(req, { arbitraryOption: true });
			const [url, callOptions] = fm.lastCall();
			expect(url).to.equal('http://a.com/');
			expect(callOptions).to.include({
				method: 'POST',
				arbitraryOption: true,
			});
			expect(fm.lastUrl()).to.equal('http://a.com/');
			const options = fm.lastOptions();

			expect(options).to.include({
				method: 'POST',
				arbitraryOption: true,
			});
			expect(fm.lastCall().request).to.equal(req);
		});

		it('Not make default signal available in options when called with Request instance using signal', () => {
			const req = new fm.config.Request('http://a.com/', {
				method: 'POST',
			});
			fm.fetchHandler(req);
			const [, callOptions] = fm.lastCall();

			expect(callOptions.signal).to.be.undefined;
			const options = fm.lastOptions();
			expect(options.signal).to.be.undefined;
		});
	});

	describe('retrieving responses', () => {
		it('exposes responses', async () => {
			fm.once('*', 200).once('*', 201, { overwriteRoutes: false });

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://a.com/');
			expect(fm.calls()[0].response.status).to.equal(200);
			expect(fm.calls()[1].response.status).to.equal(201);
			fm.restore();
		});

		it('exposes Responses', async () => {
			fm.once('*', new fm.config.Response('blah'));

			await fm.fetchHandler('http://a.com/');
			expect(fm.calls()[0].response.status).to.equal(200);
			expect(await fm.calls()[0].response.text()).to.equal('blah');
			fm.restore();
		});

		it('has lastResponse shorthand', async () => {
			fm.once('*', 200).once('*', 201, { overwriteRoutes: false });

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://a.com/');
			expect(fm.lastResponse().status).to.equal(201);
			fm.restore();
		});

		it('has readable response when response already read if using lastResponse', async () => {
			const respBody = { foo: 'bar' };
			fm.once('*', { status: 200, body: respBody }).once('*', 201, {
				overwriteRoutes: false,
			});

			const resp = await fm.fetchHandler('http://a.com/');

			await resp.json();
			expect(await fm.lastResponse().json()).to.eql(respBody);
		});
	});
});
