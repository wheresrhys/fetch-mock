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

		it('returns [url, options] pairs', async () => {
			fm.mock('http://a.com/', 200, { name: 'fetch-mock' });

			await fm.fetchHandler('http://a.com/', { method: 'get' });
			expect(fm.filterCalls()[0]).to.eql(['http://a.com/', { method: 'get' }]);
		});

		it('can retrieve all calls', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/');
			expect(fm.filterCalls().length).to.equal(2);
		});

		it('can retrieve only calls matched by any route', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/');
			expect(fm.filterCalls(true).length).to.equal(1);
			expect(fm.filterCalls(true)[0][0]).to.equal('http://a.com/');
			expect(fm.filterCalls('matched').length).to.equal(1);
			expect(fm.filterCalls('matched')[0][0]).to.equal('http://a.com/');
		});

		it('can retrieve only calls not matched by any route', async () => {
			fm.mock('http://a.com/', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/');
			expect(fm.filterCalls(false).length).to.equal(1);
			expect(fm.filterCalls(false)[0][0]).to.equal('http://b.com/');
			expect(fm.filterCalls('unmatched').length).to.equal(1);
			expect(fm.filterCalls('unmatched')[0][0]).to.equal('http://b.com/');
		});

		it('can retrieve only calls handled by a named route', async () => {
			fm.mock('http://a.com/', 200, { name: 'a' }).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/');
			expect(fm.filterCalls('a').length).to.equal(1);
			expect(fm.filterCalls('a')[0][0]).to.equal('http://a.com/');
		});

		it('can retrieve only calls handled by matcher', async () => {
			fm.mock('path:/path', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/path');
			expect(fm.filterCalls('path:/path').length).to.equal(1);
			expect(fm.filterCalls('path:/path')[0][0]).to.equal('http://b.com/path');
		});

		it('can retrieve only calls handled by a non-string matcher', async () => {
			const rx = /path/;
			fm.mock(rx, 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://b.com/path');
			expect(fm.filterCalls(rx).length).to.equal(1);
			expect(fm.filterCalls(rx)[0][0]).to.equal('http://b.com/path');
		});

		it('can retrieve only calls which match a previously undeclared matcher', async () => {
			fm.mock('http://a.com/path', 200).catch();

			await fm.fetchHandler('http://a.com/path');
			expect(fm.filterCalls('path:/path').length).to.equal(1);
			expect(fm.filterCalls('path:/path')[0][0]).to.equal('http://a.com/path');
		});

		context('filtered by method', () => {
			it('can retrieve all calls', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', { method: 'POST' });
				await fm.fetchHandler('http://b.com/');
				expect(fm.filterCalls(undefined, 'post').length).to.equal(2);
				expect(fm.filterCalls(undefined, 'POST').length).to.equal(2);
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
				expect(fm.filterCalls(true, 'post').length).to.equal(1);
				expect(fm.filterCalls(true, 'POST').length).to.equal(1);
				expect(fm.filterCalls(true, 'POST')[0]).to.eql([
					'http://a.com/',
					{ method: 'post' },
				]);
			});

			it('can retrieve only calls not matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', { method: 'POST' });
				await fm.fetchHandler('http://b.com/');
				expect(fm.filterCalls(false, 'post').length).to.equal(1);
				expect(fm.filterCalls(false, 'POST').length).to.equal(1);
				expect(fm.filterCalls(false, 'POST')[0]).to.eql([
					'http://b.com/',
					{ method: 'POST' },
				]);
			});

			it('can retrieve only calls handled by a named route', async () => {
				fm.mock('http://a.com/', 200, { name: 'a' }).catch();
				fm.mock('http://b.com/', 200, {
					name: 'b',
				}).catch();

				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/');
				expect(fm.filterCalls('a', 'post').length).to.equal(1);
				expect(fm.filterCalls('a', 'POST').length).to.equal(1);
				expect(fm.filterCalls('b').length).to.equal(1);
				expect(fm.filterCalls('a', 'POST')[0]).to.eql([
					'http://a.com/',
					{ method: 'post' },
				]);
			});

			it('can retrieve only calls handled by matcher', async () => {
				fm.mock('path:/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expect(fm.filterCalls('path:/path', 'post').length).to.equal(1);
				expect(fm.filterCalls('path:/path', 'POST').length).to.equal(1);
				expect(fm.filterCalls('path:/path', 'POST')[0]).to.eql([
					'http://b.com/path',
					{ method: 'post' },
				]);
			});

			it('can retrieve only calls handled by a non-string matcher', async () => {
				const rx = /path/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expect(fm.filterCalls(rx, 'post').length).to.equal(1);
				expect(fm.filterCalls(rx, 'POST').length).to.equal(1);
				expect(fm.filterCalls(rx, 'POST')[0]).to.eql([
					'http://b.com/path',
					{ method: 'post' },
				]);
			});

			it('can retrieve only calls which match a previously undeclared matcher', async () => {
				fm.mock('http://a.com/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', { method: 'post' });
				await fm.fetchHandler('http://b.com/path');
				expect(fm.filterCalls('path:/path', 'post').length).to.equal(1);
				expect(fm.filterCalls('path:/path', 'POST').length).to.equal(1);
				expect(fm.filterCalls('path:/path', 'POST')[0]).to.eql([
					'http://b.com/path',
					{ method: 'post' },
				]);
			});
		});

		context('filtered by options', () => {
			it('can retrieve all calls', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/');
				expect(
					fm.filterCalls(undefined, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(2);
				expect(
					fm.filterCalls(undefined, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(2);
				expect(
					fm
						.filterCalls(undefined, { headers: { 'api-key': 'abcde' } })
						.filter(([, options]) => options.headers['api-key']).length
				).to.equal(2);
			});

			it('can retrieve only calls matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/');
				expect(
					fm.filterCalls(true, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(true, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(true, { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://a.com/', { headers: { 'api-key': 'abcde' } }]);
			});

			it('can retrieve only calls not matched by any route', async () => {
				fm.mock('http://a.com/', 200).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://b.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/');
				expect(
					fm.filterCalls(false, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(false, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(false, { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://b.com/', { headers: { 'api-key': 'abcde' } }]);
			});

			it('can retrieve only calls handled by a named route', async () => {
				fm.mock('http://a.com/', 200, { name: 'here' }).catch();

				await fm.fetchHandler('http://a.com/', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://a.com/');
				expect(
					fm.filterCalls('here', { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls('here', { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls('here', { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://a.com/', { headers: { 'api-key': 'abcde' } }]);
			});

			it('can retrieve only calls handled by matcher', async () => {
				fm.mock('path:/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/path');
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })
						.length
				).to.equal(1);
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })
						.length
				).to.equal(1);
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://b.com/path', { headers: { 'api-key': 'abcde' } }]);
			});

			it('can retrieve only calls handled by a non-string matcher', async () => {
				const rx = /path/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/path');
				expect(
					fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } }).length
				).to.equal(1);
				expect(
					fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://b.com/path', { headers: { 'api-key': 'abcde' } }]);
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
				expect(fm.filterCalls(true, bodyMatcher).length).to.equal(1);
				expect(fm.filterCalls(true, bodyMatcher).length).to.equal(1);
				expect(fm.filterCalls(true, bodyMatcher)[0]).to.eql([
					'http://b.com/path',
					{
						method: 'post',
						body: JSON.stringify({ a: 1 }),
					},
				]);
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
				expect(fm.filterCalls(true, bodyMatcher).length).to.equal(1);
				expect(fm.filterCalls(true, bodyMatcher).length).to.equal(1);
				expect(fm.filterCalls(true, bodyMatcher)[0]).to.eql([
					'http://b.com/path',
					{
						method: 'post',
						body: JSON.stringify({ a: 1, b: 2 }),
					},
				]);
			});

			it('can retrieve only calls which match a previously undeclared matcher', async () => {
				fm.mock('http://a.com/path', 200).catch();

				await fm.fetchHandler('http://b.com/path', {
					headers: { 'api-key': 'abcde' },
				});
				await fm.fetchHandler('http://b.com/path');
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })
						.length
				).to.equal(1);
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })
						.length
				).to.equal(1);
				expect(
					fm.filterCalls('path:/path', { headers: { 'api-key': 'abcde' } })[0]
				).to.eql(['http://b.com/path', { headers: { 'api-key': 'abcde' } }]);
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
});
