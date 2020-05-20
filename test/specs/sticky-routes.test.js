const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock, theGlobal } = testGlobals;

describe('sticky routes', () => {
	describe('effect on routes', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore({ sticky: true }));

		describe('resetting behaviour', () => {
			it('behaviour resists resetBehavior calls', async () => {
				fm.mock('*', 200, { sticky: true }).resetBehavior();
				expect(fm.routes.length).to.equal(1);
			});

			it('behaviour resists restore calls', async () => {
				fm.mock('*', 200, { sticky: true }).restore();
				expect(fm.routes.length).to.equal(1);
			});

			it('behaviour resists reset calls', async () => {
				fm.mock('*', 200, { sticky: true }).reset();
				expect(fm.routes.length).to.equal(1);
			});

			it('behaviour does not resist resetBehavior calls when sent `sticky: true`', async () => {
				fm.mock('*', 200, { sticky: true }).resetBehavior({ sticky: true });
				expect(fm.routes.length).to.equal(0);
			});

			it('behaviour does not resist restore calls when sent `sticky: true`', async () => {
				fm.mock('*', 200, { sticky: true }).restore({ sticky: true });
				expect(fm.routes.length).to.equal(0);
			});

			it('behaviour does not resist reset calls when sent `sticky: true`', async () => {
				fm.mock('*', 200, { sticky: true }).reset({ sticky: true });
				expect(fm.routes.length).to.equal(0);
			});
		});

		describe('resetting history', () => {
			it('history does not resist resetHistory calls', async () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.resetHistory();
				expect(fm.called()).to.be.false;
			});

			it('history does not resist restore calls', async () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.restore();
				expect(fm.called()).to.be.false;
			});

			it('history does not resist reset calls', async () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.reset();
				expect(fm.called()).to.be.false;
			});
		});

		describe('multiple routes', () => {
			it('can have multiple sticky routes', async () => {
				fm.mock('*', 200, { sticky: true })
					.mock('http://a.com', 200, { sticky: true })
					.resetBehavior();
				expect(fm.routes.length).to.equal(2);
			});

			it('can have a sticky route before non-sticky routes', async () => {
				fm.mock('*', 200, { sticky: true })
					.mock('http://a.com', 200)
					.resetBehavior();
				expect(fm.routes.length).to.equal(1);
				expect(fm.routes[0].url).to.equal('*');
			});

			it('can have a sticky route after non-sticky routes', async () => {
				fm.mock('*', 200)
					.mock('http://a.com', 200, { sticky: true })
					.resetBehavior();
				expect(fm.routes.length).to.equal(1);
				expect(fm.routes[0].url).to.equal('http://a.com');
			});
		});
	});
	describe('global mocking', () => {
		let originalFetch;
		before(() => {
			originalFetch = theGlobal.fetch = sinon.stub().returns(Promise.resolve());
		});
		afterEach(() => fetchMock.restore({ sticky: true }));

		it('global mocking resists resetBehavior calls', async () => {
			fetchMock.mock('*', 200, { sticky: true }).resetBehavior();
			expect(theGlobal.fetch).not.to.equal(originalFetch);
		});

		it('global mocking does not resist resetBehavior calls when sent `sticky: true`', async () => {
			fetchMock
				.mock('*', 200, { sticky: true })
				.resetBehavior({ sticky: true });
			expect(theGlobal.fetch).to.equal(originalFetch);
		});
	});

	describe('sandboxes', () => {
		it('sandboxed instances should inherit stickiness', async () => {
			const sbx1 = fetchMock
				.sandbox()
				.mock('*', 200, { sticky: true })
				.catch(300);

			const sbx2 = sbx1.sandbox().resetBehavior();

			expect(sbx1.routes.length).to.equal(1);
			expect(sbx2.routes.length).to.equal(1);

			sbx2.resetBehavior({ sticky: true });

			expect(sbx1.routes.length).to.equal(1);
			expect(sbx2.routes.length).to.equal(0);
		});
	});
});
