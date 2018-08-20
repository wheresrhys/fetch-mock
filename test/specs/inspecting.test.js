// cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// consider case where multiple routes match.. make sure only one matcher logs calls
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

module.exports = fetchMock => {
	describe('inspecting', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		describe('constants', () => {
			it('has a MATCHED constant equal to true', () => {
				expect(fetchMock.MATCHED).to.equal(true);
			});
			it('has a UNMATCHED constant equal to false', () => {
				expect(fetchMock.UNMATCHED).to.equal(false);
			});
		});

		describe('api', () => {
			describe('signatures', () => {
				before(() => {
					fm.mock('http://it.at.here/', 200).mock('http://it.at.there/', 200);
					return fm.fetchHandler('http://it.at.here/', { method: 'post' });
				});
				after(() => fm.restore());
				it('called() returns boolean', () => {
					expect(fm.called('http://it.at.here/')).to.be.true;
					expect(fm.called('http://it.at.there/')).to.be.false;
				});
				it('calls() returns array of calls', () => {
					expect(fm.calls('http://it.at.here/')).to.eql([
						['http://it.at.here/', { method: 'post' }]
					]);
					expect(fm.calls('http://it.at.there/')).to.eql([]);
				});
				it('lastCall() returns array of parameters', () => {
					expect(fm.lastCall('http://it.at.here/')).to.eql([
						'http://it.at.here/',
						{ method: 'post' }
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
						method: 'post'
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
				it('called() uses the internal filtering method', () => {
					fm.called('name', { an: 'option' });
					expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
						.true;
				});
				it('calls() uses the internal filtering method', () => {
					fm.calls('name', { an: 'option' });
					expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
						.true;
				});
				it('lastCall() uses the internal filtering method', () => {
					fm.lastCall('name', { an: 'option' });
					expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
						.true;
				});
				it('lastUrl() uses the internal filtering method', () => {
					fm.lastUrl('name', { an: 'option' });
					expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
						.true;
				});
				it('lastOptions() uses the internal filtering method', () => {
					fm.lastOptions('name', { an: 'option' });
					expect(fm.filterCalls.calledWith('name', { an: 'option' })).to.be
						.true;
				});
			});
		});

		describe('filtering', () => {
			before(async () => {
				fm.mock('http://it.at.here/', 200, { name: 'fetch-mock' })
					.mock('path:/path', 200)
					.mock('http://it.at.thereabouts/', 200)
					.catch();

				await fm.fetchHandler('http://it.at.here/', { method: 'get' });
				await fm.fetchHandler('http://it.at.here/', { method: 'get' });
				await fm.fetchHandler('http://it.at.there/path', { method: 'get' });
				await fm.fetchHandler('http://it.at.where/', { method: 'post' });
			});
			after(() => fm.restore());

			it('can retrieve all calls', () => {
				expect(fm.filterCalls().length).to.equal(4);
			});

			it('can retrieve only calls matched by any route', () => {
				expect(fm.filterCalls(true).length).to.equal(3);
			});

			it('can retrieve only calls not matched by no route', () => {
				expect(fm.filterCalls(false).length).to.equal(1);
			});

			it('can retrieve only calls handled by a named route', () => {
				expect(fm.filterCalls('fetch-mock').length).to.equal(2);
				expect(fm.filterCalls('path:/path').length).to.equal(1);
			});

			it('can retrieve only calls handled by matcher', () => {
				expect(fm.filterCalls('end:/path').length).to.equal(1);
			});

			it('can retrieve only calls retrieved by a matcher with a method filter', () => {
				expect(fm.filterCalls(/where/, 'get').length).to.equal(0);
				expect(fm.filterCalls(/where/, 'post').length).to.equal(1);
			});

			it('can retrieve only calls retrieved by a matcher with options', () => {
				expect(
					fm.filterCalls(/where/, { query: { egg: 'face' } }).length
				).to.equal(0);
				expect(fm.filterCalls(/where/, { method: 'post' }).length).to.equal(1);
			});

			it('returns [url, options] pairs', () => {
				expect(fm.filterCalls()[0]).to.eql([
					'http://it.at.here/',
					{ method: 'get' }
				]);
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
			});
		});

		describe('route name resolution', () => {
			afterEach(() => fm.restore());
			it('can filter by named routes', async () => {
				fm.mock('http://it.at.here2/', 200, {
					name: 'my-route'
				});

				await fm.fetchHandler('http://it.at.here2/');

				expect(fm.called('my-route')).to.be.true;
			});

			it('can filter by string based matchers', async () => {
				fm.mock('http://it.at.here/', 200)
					.mock('begin:http://it.at.there/', 200)
					.mock('glob:*/a/*', 200)
					.mock('path:/henry', 200);

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.there/');
				await fm.fetchHandler('http://it.at.where/henry');

				expect(fm.called('http://it.at.here/')).to.be.true;
				expect(fm.called('begin:http://it.at.there/')).to.be.true;
				expect(fm.called('path:/henry')).to.be.true;
				expect(fm.called('glob:*/a/*')).to.be.false;
			});

			it('can filter by regex matchers', async () => {
				fm.mock(/it\.at\.here/, 200);

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called(/it\.at\.here/)).to.be.true;
			});

			it('can filter by function matchers', async () => {
				const myFunc = () => true;
				fm.mock(myFunc, 200);

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called(myFunc)).to.be.true;
			});

			it('can filter by url even if not a matcher', async () => {
				const myFunc = () => true;
				fm.mock(myFunc, 200);

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called('http://it.at.here/')).to.be.true;
			});

			it('can filter by url even if not a matcher and called with Request', async () => {
				const myFunc = () => true;
				fm.mock(myFunc, 200);

				await fm.fetchHandler(new fm.config.Request('http://it.at.here/'));

				expect(fm.called('http://it.at.here/')).to.be.true;
			});
		});

		describe('filtering cascade', () => {
			before(async () => {
				fm.once('*', 200, { name: 'path:/asname' })
					.mock('begin:http://it.at.there', 200)
					.mock('end:/notmatch', 200);

				await fm.fetchHandler('http://it.at.there/notmatch');
				await fm.fetchHandler('http://it.at.there/notmatch');
			});
			after(() => fm.restore());

			it('match as name first', async () => {
				expect(fm.calls('path:/asname').length).to.equal(1);
			});

			it('match as matcher.toString() second', async () => {
				expect(fm.calls('begin:http://it.at.there').length).to.equal(1);
			});

			it('match as executable third', async () => {
				expect(fm.calls('path:/notmatch').length).to.equal(2);
			});

			it('not match as executable if is matcher.toString() of existing route', async () => {
				expect(fm.calls('express:/notmatch').length).to.equal(0);
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
				expect(fm.lastCall()).to.eql([
					'http://it.at.here/',
					{ method: 'POST' },
					req
				]);
				expect(fm.lastUrl()).to.equal('http://it.at.here/');
				expect(fm.lastOptions()).to.eql({ method: 'POST' });
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
