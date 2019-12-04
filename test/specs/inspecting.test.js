// cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// consider case where multiple routes match.. make sure only one matcher logs calls
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock, theGlobal, AbortController) => {
	describe('inspecting', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		describe('api', () => {
			describe('signatures', () => {
				before(() => {
					fm.mock('http://it.at.here/', 200).mock('http://it.at.there/', 200);
					return fm.fetchHandler('http://it.at.here/', {
						method: 'post',
						arbitraryOption: true
					});
				});
				after(() => fm.restore());
				it('called() returns boolean', () => {
					expect(fm.called('http://it.at.here/')).to.be.true;
					expect(fm.called('http://it.at.there/')).to.be.false;
				});
				it('calls() returns array of calls', () => {
					expect(fm.calls('http://it.at.here/')).to.eql([
						['http://it.at.here/', { method: 'post', arbitraryOption: true }]
					]);
					expect(fm.calls('http://it.at.there/')).to.eql([]);
				});
				it('lastCall() returns array of parameters', () => {
					expect(fm.lastCall('http://it.at.here/')).to.eql([
						'http://it.at.here/',
						{ method: 'post', arbitraryOption: true }
					]);
					expect(fm.lastCall('http://it.at.there/')).to.be.undefined;
				});
				it('lastUrl() returns string', () => {
					expect(fm.lastUrl('http://it.at.here/')).to.equal(
						'http://it.at.here/'
					);
					expect(fm.lastUrl('http://it.at.there/')).to.be.undefined;
				});
				it('lastOptions() returns object', () => {
					expect(fm.lastOptions('http://it.at.here/')).to.eql({
						method: 'post',
						arbitraryOption: true
					});
					expect(fm.lastOptions('http://it.at.there/')).to.be.undefined;
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
					method => {
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
				fm.mock('http://it.at.here/', 200, { name: 'fetch-mock' })
					.mock('path:/path', 200)
					.mock('http://it.at.thereabouts/', 200)
					.catch();

				await fm.fetchHandler('http://it.at.here/', { method: 'get' });
				await fm.fetchHandler('http://it.at.here/', { method: 'get' });
				await fm.fetchHandler('http://it.at.there/path', { method: 'get' });
				await fm.fetchHandler('http://it.at.where/', { method: 'post' });
				expect(fm.filterCalls()[0]).to.eql([
					'http://it.at.here/',
					{ method: 'get' }
				]);
			});

			it('can retrieve all calls', async () => {
				fm.mock('http://it.at.here/', 200).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.where/');
				expect(fm.filterCalls().length).to.equal(2);
			});

			it('can retrieve only calls matched by any route', async () => {
				fm.mock('http://it.at.here/', 200).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.where/');
				expect(fm.filterCalls(true).length).to.equal(1);
				expect(fm.filterCalls(true)[0][0]).to.equal('http://it.at.here/');
				expect(fm.filterCalls('matched').length).to.equal(1);
				expect(fm.filterCalls('matched')[0][0]).to.equal('http://it.at.here/');
			});

			it('can retrieve only calls not matched by any route', async () => {
				fm.mock('http://it.at.here/', 200).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.where/');
				expect(fm.filterCalls(false).length).to.equal(1);
				expect(fm.filterCalls(false)[0][0]).to.equal('http://it.at.where/');
				expect(fm.filterCalls('unmatched').length).to.equal(1);
				expect(fm.filterCalls('unmatched')[0][0]).to.equal(
					'http://it.at.where/'
				);
			});

			it('can retrieve only calls handled by a named route', async () => {
				fm.mock('http://it.at.here/', 200, { name: 'here' }).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.there');
				expect(fm.filterCalls('here').length).to.equal(1);
				expect(fm.filterCalls('here')[0][0]).to.equal('http://it.at.here/');
			});

			it('can retrieve only calls handled by matcher', async () => {
				fm.mock('path:/path', 200).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.there/path');
				expect(fm.filterCalls('path:/path').length).to.equal(1);
				expect(fm.filterCalls('path:/path')[0][0]).to.equal(
					'http://it.at.there/path'
				);
			});

			it('can retrieve only calls handled by a non-string matcher', async () => {
				const rx = /path/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.there/path');
				expect(fm.filterCalls(rx).length).to.equal(1);
				expect(fm.filterCalls(rx)[0][0]).to.equal('http://it.at.there/path');
			});

			it('can retrieve only calls which match a previously undeclared matcher', async () => {
				fm.mock('http://it.at.here/path', 200).catch();

				await fm.fetchHandler('http://it.at.here/path');
				expect(fm.filterCalls('path:/path').length).to.equal(1);
				expect(fm.filterCalls('path:/path')[0][0]).to.equal(
					'http://it.at.here/path'
				);
			});

			context('filtered by method', () => {
				it('can retrieve all calls', async () => {
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', { method: 'post' });
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', { method: 'POST' });
					await fm.fetchHandler('http://it.at.where/');
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
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', { method: 'post' });
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', { method: 'POST' });
					await fm.fetchHandler('http://it.at.where/');
					expect(fm.filterCalls(true, 'post').length).to.equal(1);
					expect(fm.filterCalls(true, 'POST').length).to.equal(1);
					expect(fm.filterCalls(true, 'POST')[0]).to.eql([
						'http://it.at.here/',
						{ method: 'post' }
					]);
				});

				it('can retrieve only calls not matched by any route', async () => {
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', { method: 'post' });
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', { method: 'POST' });
					await fm.fetchHandler('http://it.at.where/');
					expect(fm.filterCalls(false, 'post').length).to.equal(1);
					expect(fm.filterCalls(false, 'POST').length).to.equal(1);
					expect(fm.filterCalls(false, 'POST')[0]).to.eql([
						'http://it.at.where/',
						{ method: 'POST' }
					]);
				});

				it('can retrieve only calls handled by a named route', async () => {
					fm.mock('http://it.at.here/', 200, { name: 'here' }).catch();
					fm.mock('http://caps.it.at.here/', 200, {
						name: 'hereWithCaps'
					}).catch();

					await fm.fetchHandler('http://it.at.here/', { method: 'post' });
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://caps.it.at.here/');
					expect(fm.filterCalls('here', 'post').length).to.equal(1);
					expect(fm.filterCalls('here', 'POST').length).to.equal(1);
					expect(fm.filterCalls('hereWithCaps').length).to.equal(1);
					expect(fm.filterCalls('here', 'POST')[0]).to.eql([
						'http://it.at.here/',
						{ method: 'post' }
					]);
				});

				it('can retrieve only calls handled by matcher', async () => {
					fm.mock('path:/path', 200).catch();

					await fm.fetchHandler('http://it.at.there/path', { method: 'post' });
					await fm.fetchHandler('http://it.at.there/path');
					expect(fm.filterCalls('path:/path', 'post').length).to.equal(1);
					expect(fm.filterCalls('path:/path', 'POST').length).to.equal(1);
					expect(fm.filterCalls('path:/path', 'POST')[0]).to.eql([
						'http://it.at.there/path',
						{ method: 'post' }
					]);
				});

				it('can retrieve only calls handled by a non-string matcher', async () => {
					const rx = /path/;
					fm.mock(rx, 200).catch();

					await fm.fetchHandler('http://it.at.there/path', { method: 'post' });
					await fm.fetchHandler('http://it.at.there/path');
					expect(fm.filterCalls(rx, 'post').length).to.equal(1);
					expect(fm.filterCalls(rx, 'POST').length).to.equal(1);
					expect(fm.filterCalls(rx, 'POST')[0]).to.eql([
						'http://it.at.there/path',
						{ method: 'post' }
					]);
				});

				it('can retrieve only calls which match a previously undeclared matcher', async () => {
					fm.mock('http://it.at.here/path', 200).catch();

					await fm.fetchHandler('http://it.at.there/path', { method: 'post' });
					await fm.fetchHandler('http://it.at.there/path');
					expect(fm.filterCalls('path:/path', 'post').length).to.equal(1);
					expect(fm.filterCalls('path:/path', 'POST').length).to.equal(1);
					expect(fm.filterCalls('path:/path', 'POST')[0]).to.eql([
						'http://it.at.there/path',
						{ method: 'post' }
					]);
				});
			});

			context('filtered by options', () => {
				it('can retrieve all calls', async () => {
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.where/');
					expect(
						fm.filterCalls(undefined, { headers: { 'api-key': 'abcde' } })
							.length
					).to.equal(2);
					expect(
						fm.filterCalls(undefined, { headers: { 'api-key': 'abcde' } })
							.length
					).to.equal(2);
					expect(
						fm
							.filterCalls(undefined, { headers: { 'api-key': 'abcde' } })
							.filter(([, options]) => options.headers['api-key']).length
					).to.equal(2);
				});

				it('can retrieve only calls matched by any route', async () => {
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.where/');
					expect(
						fm.filterCalls(true, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(true, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(true, { headers: { 'api-key': 'abcde' } })[0]
					).to.eql(['http://it.at.here/', { headers: { 'api-key': 'abcde' } }]);
				});

				it('can retrieve only calls not matched by any route', async () => {
					fm.mock('http://it.at.here/', 200).catch();

					await fm.fetchHandler('http://it.at.here/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.where/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.where/');
					expect(
						fm.filterCalls(false, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(false, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(false, { headers: { 'api-key': 'abcde' } })[0]
					).to.eql([
						'http://it.at.where/',
						{ headers: { 'api-key': 'abcde' } }
					]);
				});

				it('can retrieve only calls handled by a named route', async () => {
					fm.mock('http://it.at.here/', 200, { name: 'here' }).catch();

					await fm.fetchHandler('http://it.at.here/', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.here/');
					expect(
						fm.filterCalls('here', { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls('here', { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls('here', { headers: { 'api-key': 'abcde' } })[0]
					).to.eql(['http://it.at.here/', { headers: { 'api-key': 'abcde' } }]);
				});

				it('can retrieve only calls handled by matcher', async () => {
					fm.mock('path:/path', 200).catch();

					await fm.fetchHandler('http://it.at.there/path', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.there/path');
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
					).to.eql([
						'http://it.at.there/path',
						{ headers: { 'api-key': 'abcde' } }
					]);
				});

				it('can retrieve only calls handled by a non-string matcher', async () => {
					const rx = /path/;
					fm.mock(rx, 200).catch();

					await fm.fetchHandler('http://it.at.there/path', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.there/path');
					expect(
						fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } }).length
					).to.equal(1);
					expect(
						fm.filterCalls(rx, { headers: { 'api-key': 'abcde' } })[0]
					).to.eql([
						'http://it.at.there/path',
						{ headers: { 'api-key': 'abcde' } }
					]);
				});

				it('can retrieve only calls which match a previously undeclared matcher', async () => {
					fm.mock('http://it.at.here/path', 200).catch();

					await fm.fetchHandler('http://it.at.there/path', {
						headers: { 'api-key': 'abcde' }
					});
					await fm.fetchHandler('http://it.at.there/path');
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
					).to.eql([
						'http://it.at.there/path',
						{ headers: { 'api-key': 'abcde' } }
					]);
				});
			});
		});

		describe('call order', () => {
			it('retrieves calls in correct order', () => {
				fm.mock('http://it.at.here/', 200)
					.mock('http://it.at.there/', 200)
					.catch();

				fm.fetchHandler('http://it.at.here/');
				fm.fetchHandler('http://it.at.there/');
				fm.fetchHandler('http://it.at.where/');
				expect(fm.calls()[0][0]).to.equal('http://it.at.here/');
				expect(fm.calls()[1][0]).to.equal('http://it.at.there/');
				expect(fm.calls()[2][0]).to.equal('http://it.at.where/');
				fm.reset();
			});
		});

		describe('retrieving call parameters', () => {
			before(() => {
				fm.mock('http://it.at.here/', 200);
				fm.fetchHandler('http://it.at.here/');
				fm.fetchHandler('http://it.at.here/', { method: 'POST' });
			});
			after(() => fm.restore());

			it('calls (call history)', () => {
				expect(fm.calls()[0]).to.eql(['http://it.at.here/', undefined]);
				expect(fm.calls()[1]).to.eql([
					'http://it.at.here/',
					{ method: 'POST' }
				]);
			});

			it('lastCall', () => {
				expect(fm.lastCall()).to.eql([
					'http://it.at.here/',
					{ method: 'POST' }
				]);
			});

			it('lastOptions', () => {
				expect(fm.lastOptions()).to.eql({ method: 'POST' });
			});

			it('lastUrl', () => {
				expect(fm.lastUrl()).to.eql('http://it.at.here/');
			});

			it('when called with Request instance', () => {
				const req = new fm.config.Request('http://it.at.here/', {
					method: 'POST'
				});
				fm.fetchHandler(req);
				const [url, callOptions] = fm.lastCall();

				expect(url).to.equal('http://it.at.here/');
				expect(callOptions).to.include({ method: 'POST' });
				expect(fm.lastUrl()).to.equal('http://it.at.here/');
				const options = fm.lastOptions();
				expect(options).to.eql({ method: 'POST' });
				expect(fm.lastCall().request).to.equal(req);
			});

			it('when called with Request instance and arbitrary option', () => {
				const req = new fm.config.Request('http://it.at.here/', {
					method: 'POST'
				});
				fm.fetchHandler(req, { arbitraryOption: true });
				const [url, callOptions] = fm.lastCall();
				expect(url).to.equal('http://it.at.here/');
				expect(callOptions).to.include({
					method: 'POST',
					arbitraryOption: true
				});
				expect(fm.lastUrl()).to.equal('http://it.at.here/');
				const options = fm.lastOptions();

				expect(options).to.eql({
					method: 'POST',
					arbitraryOption: true
				});
				expect(fm.lastCall().request).to.equal(req);
			});

			it('Make signal available in options when called with Request instance using signal', () => {
				const controller = new AbortController();
				const req = new fm.config.Request('http://it.at.here/', {
					method: 'POST',
					signal: controller.signal
				});
				fm.fetchHandler(req);
				const [, callOptions] = fm.lastCall();

				expect(callOptions).to.eql({
					method: 'POST',
					signal: controller.signal
				});
				const options = fm.lastOptions();
				expect(options).to.eql({ method: 'POST', signal: controller.signal });
				expect(fm.lastCall().request).to.equal(req);
			});
		});

		describe('flushing pending calls', () => {
			afterEach(() => fm.restore());

			it('flush resolves if all fetches have resolved', async () => {
				fm.mock('http://one.com/', 200).mock('http://two.com/', 200);
				// no expectation, but if it doesn't work then the promises will hang
				// or reject and the test will timeout
				await fm.flush();
				fetch('http://one.com');
				await fm.flush();
				fetch('http://two.com');
				await fm.flush();
			});

			it('should resolve after fetches', async () => {
				fm.mock('http://example/', 'working!');
				let data;
				fetch('http://example').then(() => (data = 'done'));
				await fm.flush();
				expect(data).to.equal('done');
			});

			describe('response methods', () => {
				it('should resolve after .json() if waitForResponseMethods option passed', async () => {
					fm.mock('http://example/', { a: 'ok' });
					let data;
					fetch('http://example/')
						.then(res => res.json())
						.then(() => (data = 'done'));

					await fm.flush(true);
					expect(data).to.equal('done');
				});

				it('should resolve after .json() if waitForResponseMethods option passed', async () => {
					fm.mock('http://example/', 'bleurgh');
					let data;
					fetch('http://example/')
						.then(res => res.json())
						.catch(() => (data = 'done'));

					await fm.flush(true);
					expect(data).to.equal('done');
				});

				it('should resolve after .text() if waitForResponseMethods option passed', async () => {
					fm.mock('http://example/', 'working!');
					let data;
					fetch('http://example/')
						.then(res => res.text())
						.then(() => (data = 'done'));

					await fm.flush(true);
					expect(data).to.equal('done');
				});
			});

			it('flush waits for unresolved promises', async () => {
				fm.mock('http://one.com/', 200).mock(
					'http://two.com/',
					() => new Promise(res => setTimeout(() => res(200), 50))
				);

				const orderedResults = [];
				fetch('http://one.com/');
				fetch('http://two.com/');

				setTimeout(() => orderedResults.push('not flush'), 25);

				await fm.flush();
				orderedResults.push('flush');
				expect(orderedResults).to.deep.equal(['not flush', 'flush']);
			});

			it('flush resolves on expected error', async () => {
				fm.mock('http://one.com/', { throws: 'Problem in space' });
				await fm.flush();
			});
		});
	});
};
