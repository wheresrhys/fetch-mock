// cover case where GET, POST etc are differently named routes
// ... maybe accept method as second argument to calls, called etc
// consider case where multiple routes match.. make sure only one matcher logs calls
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
	describe('inspecting', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		describe('filtering', () => {
			before(async () => {
				fm
					.mock('http://it.at.here/', 200)
					.mock('http://it.at.there/', 200)
					.mock('http://it.at.thereabouts/', 200)
					.catch();

				await fm.fetchHandler('http://it.at.here/', {method: 'get'})
				await fm.fetchHandler('http://it.at.here/', {method: 'get'})
				await fm.fetchHandler('http://it.at.there/', {method: 'get'})
			});
			after(() => fm.restore());

			it('`called` filters on match types', () => {
				expect(fm.called()).to.be.true;
				expect(fm.called(true)).to.be.true;
				expect(fm.called('http://it.at.here/')).to.be.true;
				expect(fm.called('http://it.at.thereabouts/')).to.be.false;
				expect(fm.called(false)).to.be.false;
			});

			it('`calls` filters on match types', () => {
				expect(fm.calls().length).to.equal(3);
				expect(fm.calls(true).length).to.equal(3);
				expect(fm.calls('http://it.at.here/').length).to.equal(2);
				expect(fm.calls('http://it.at.there/').length).to.equal(1);
				expect(fm.calls('http://it.at.thereabouts/').length).to.equal(0);
				expect(fm.calls(false).length).to.equal(0);
			});

			it('`lastCall` filters on match types', () => {
				expect(fm.lastCall()).to.exist;
				expect(fm.lastCall(true)).to.exist;
				expect(fm.lastCall('http://it.at.here/')).to.exist;
				expect(fm.lastCall('http://it.at.there/')).to.exist;
				expect(fm.lastCall('http://it.at.thereabouts/')).not.to.exist;
				expect(fm.lastCall(false)).not.to.exist;
			});

			it('`lastUrl` filters on match types', () => {
				expect(fm.lastUrl()).to.exist;
				expect(fm.lastUrl(true)).to.exist;
				expect(fm.lastUrl('http://it.at.here/')).to.exist;
				expect(fm.lastUrl('http://it.at.there/')).to.exist;
				expect(fm.lastUrl('http://it.at.thereabouts/')).not.to.exist;
				expect(fm.lastUrl(false)).not.to.exist;
			});

			it('`lastOptions` filters on match types', () => {
				expect(fm.lastOptions()).to.exist;
				expect(fm.lastOptions(true)).to.exist;
				expect(fm.lastOptions('http://it.at.here/')).to.exist;
				expect(fm.lastOptions('http://it.at.there/')).to.exist;
				expect(fm.lastOptions('http://it.at.thereabouts/')).not.to.exist;
				expect(fm.lastOptions(false)).not.to.exist;
			});

			describe('when unmatched calls exist', () => {
				before(async () => {
					await fm.fetchHandler('http://it.at.where/', {method: 'get'})
				});
				it('`called` filters on match types', () => {
					expect(fm.called(false)).to.be.true;
				});

				it('`calls` filters on match types', () => {
					expect(fm.calls(false).length).to.equal(1);
				});

				it('`lastCall` filters on match types', () => {
					expect(fm.lastCall(false)).to.exist;
				});

				it('`lastUrl` filters on match types', () => {
					expect(fm.lastUrl(false)).to.exist;
				});

				it('`lastOptions` filters on match types', () => {
					expect(fm.lastOptions(false)).to.exist;
				});
			});
		});

		describe('call order', () => {
			it('retrieves calls in correct order', () => {
				fm
					.mock('http://it.at.here', 200)
					.mock('http://it.at.there', 200)
					.catch()

				fm.fetchHandler('http://it.at.here');
				fm.fetchHandler('http://it.at.there');
				fm.fetchHandler('http://it.at.where');
				expect(fm.calls()[0][0]).to.equal('http://it.at.here');
				expect(fm.calls()[1][0]).to.equal('http://it.at.there');
				expect(fm.calls()[2][0]).to.equal('http://it.at.where');
			})
		});

		describe('route name resolution', () => {
			afterEach(() => fm.restore());
			it('can filter by named routes', async () => {
				fm
					.mock('http://it.at.here/', 200, {
						name: 'my-route'
					});

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called('http://it.at.here/')).to.be.false;
				expect(fm.called('my-route')).to.be.true;
			});

			it('can filter by string based matchers', async () => {
				fm
					.mock('http://it.at.here/', 200)
					.mock('begin:http://it.at.there/', 200)
					.mock('glob:*/a/*', 200);

				await fm.fetchHandler('http://it.at.here/');
				await fm.fetchHandler('http://it.at.there/');

				expect(fm.called('http://it.at.here/')).to.be.true;
				expect(fm.called('begin:http://it.at.there/')).to.be.true;
				expect(fm.called('glob:*/a/*')).to.be.false;
			});

			it('can filter by regex matchers', async () => {
				fm
					.mock(/it\.at\.here/, 200)

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called(/it\.at\.here/)).to.be.true;
			});

			it('can filter by function matchers', async () => {
				const myFunc = () => true;
				fm
					.mock(myFunc, 200)

				await fm.fetchHandler('http://it.at.here/');

				expect(fm.called(myFunc)).to.be.true;
			});

		});

		describe('retrieving call parameters', () => {
			before(() => {
				fm.mock('http://it.at.here/', 200);
				fm.fetchHandler('http://it.at.here/');
				fm.fetchHandler('http://it.at.here/', {method: 'POST'});
			})
			after(() => fm.restore());
			it('calls (call history)', () => {
				expect(fm.calls()[0]).to.eql(['http://it.at.here/', undefined]);
				expect(fm.calls()[1]).to.eql(['http://it.at.here/', {method: 'POST'}]);
			});

			it('lastCall', () => {
				expect(fm.lastCall()).to.eql(['http://it.at.here/', {method: 'POST'}]);
			});

			it('lastOptions', () => {
				expect(fm.lastOptions()).to.eql({method: 'POST'});
			});

			it('lastUrl', () => {
				expect(fm.lastUrl()).to.eql('http://it.at.here/');
			});

			it('when called with Request instance', () => {
				const req = new fm.config.Request('http://it.at.here/', {method: 'POST'});
				fm.fetchHandler(req);
				expect(fm.lastCall()).to.eql([req, undefined]);
				expect(fm.lastUrl()).to.equal('http://it.at.here/');
				expect(fm.lastOptions()).to.equal(req);
			});

		})


		describe('flushing pending calls', () => {
			afterEach(() => fm.restore());

			it('flush resolves if all fetches have resolved', async () => {
				fm
					.mock('http://one.com', 200)
					.mock('http://two.com', 200)
				// no expectation, but if it doesn't work then the promises will hang
				// or reject and the test will timeout
				await fm.flush()
				fetch('http://one.com')
				await fm.flush()
				fetch('http://two.com')
				await fm.flush()
			})

			it('should resolve after fetches', async () => {
				fm.mock('http://example', 'working!')
				let data;
				fetch('http://example')
					.then(() => data = 'done');
				await fm.flush()
				expect(data).to.equal('done');
			})

			it('flush waits for unresolved promises', async () => {
				fm
					.mock('http://one.com', 200)
					.mock('http://two.com', () => new Promise(res => setTimeout(() => res(200), 50)))

				const orderedResults = []
				fetch('http://one.com')
				fetch('http://two.com')

				setTimeout(() => orderedResults.push('not flush'), 25)

				await fm.flush()
				orderedResults.push('flush');
				expect(orderedResults).to.deep.equal(['not flush', 'flush']);
			})

			it('flush resolves on expected error', async () => {
				fm
					.mock('http://one.com', {throws: 'Problem in space'})
				await fm.flush();
			});
		});
	});
};
