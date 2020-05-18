const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock, theGlobal } = testGlobals;
describe('sandbox', () => {
	let originalFetch;

	before(() => {
		originalFetch = theGlobal.fetch = sinon
			.stub()
			.returns(Promise.resolve('dummy'));
	});

	it('return function', () => {
		const sbx = fetchMock.sandbox();
		expect(typeof sbx).to.equal('function');
	});

	it('inherit settings from parent instance', () => {
		const sbx = fetchMock.sandbox();
		expect(sbx.config).to.eql(fetchMock.config);
	});

	it('implement full fetch-mock api', () => {
		const sbx = fetchMock.sandbox();
		for (const key in fetchMock) {
			expect(typeof sbx[key]).to.equal(typeof fetchMock[key]);
		}
	});

	it('delegate to its own fetch handler', async () => {
		const sbx = fetchMock.sandbox().mock('http://a.com', 200);

		sinon.stub(sbx, 'fetchHandler');

		sbx('http://a.com');
		expect(sbx.fetchHandler).calledWith('http://a.com');
	});

	it("don't interfere with global fetch", () => {
		const sbx = fetchMock.sandbox().mock('http://a.com', 200);

		expect(theGlobal.fetch).to.equal(originalFetch);
		expect(theGlobal.fetch).not.to.equal(sbx);
	});

	it("don't interfere with global fetch-mock", async () => {
		const sbx = fetchMock.sandbox().mock('http://a.com', 200).catch(302);

		fetchMock.mock('http://b.com', 200).catch(301);

		expect(theGlobal.fetch).to.equal(fetchMock.fetchHandler);
		expect(fetchMock.fetchHandler).not.to.equal(sbx);
		expect(fetchMock.fallbackResponse).not.to.equal(sbx.fallbackResponse);
		expect(fetchMock.routes).not.to.equal(sbx.routes);

		const [sandboxed, globally] = await Promise.all([
			sbx('http://a.com'),
			fetch('http://b.com'),
		]);

		expect(sandboxed.status).to.equal(200);
		expect(globally.status).to.equal(200);
		expect(sbx.called('http://a.com')).to.be.true;
		expect(sbx.called('http://b.com')).to.be.false;
		expect(fetchMock.called('http://b.com')).to.be.true;
		expect(fetchMock.called('http://a.com')).to.be.false;
		expect(sbx.called('http://a.com')).to.be.true;
		fetchMock.restore();
	});

	it("don't interfere with other sandboxes", async () => {
		const sbx = fetchMock.sandbox().mock('http://a.com', 200).catch(301);

		const sbx2 = fetchMock.sandbox().mock('http://b.com', 200).catch(302);

		expect(sbx2).not.to.equal(sbx);
		expect(sbx2.fallbackResponse).not.to.equal(sbx.fallbackResponse);
		expect(sbx2.routes).not.to.equal(sbx.routes);

		const [res1, res2] = await Promise.all([
			sbx('http://a.com'),
			sbx2('http://b.com'),
		]);
		expect(res1.status).to.equal(200);
		expect(res2.status).to.equal(200);
		expect(sbx.called('http://a.com')).to.be.true;
		expect(sbx.called('http://b.com')).to.be.false;
		expect(sbx2.called('http://b.com')).to.be.true;
		expect(sbx2.called('http://a.com')).to.be.false;
	});

	it('can be restored', async () => {
		const sbx = fetchMock.sandbox().get('https://a.com', 200);

		const res = await sbx('https://a.com');
		expect(res.status).to.equal(200);

		sbx.restore().get('https://a.com', 500);

		const res2 = await sbx('https://a.com');
		expect(res2.status).to.equal(500);
	});

	it("can 'fork' existing sandboxes or the global fetchMock", () => {
		const sbx1 = fetchMock.sandbox().mock(/a/, 200).catch(300);

		const sbx2 = sbx1.sandbox().mock(/b/, 200).catch(400);

		expect(sbx1.routes.length).to.equal(1);
		expect(sbx2.routes.length).to.equal(2);
		expect(sbx1.fallbackResponse).to.equal(300);
		expect(sbx2.fallbackResponse).to.equal(400);
		sbx1.restore();
		expect(sbx1.routes.length).to.equal(0);
		expect(sbx2.routes.length).to.equal(2);
	});

	it('error if spy() is called and no fetch defined in config', () => {
		const fm = fetchMock.sandbox();
		delete fm.config.fetch;
		expect(() => fm.spy()).to.throw();
	});

	it("don't error if spy() is called and fetch defined in config", () => {
		const fm = fetchMock.sandbox();
		fm.config.fetch = originalFetch;
		expect(() => fm.spy()).not.to.throw();
	});

	it('exports a properly mocked node-fetch module shape', () => {
		// uses node-fetch default require pattern
		const { default: fetch, Headers, Request, Response } = fetchMock.sandbox();

		expect(fetch.name).to.equal('fetchMockProxy');
		expect(new Headers()).to.be.an.instanceOf(fetchMock.config.Headers);
		expect(new Request('http://a.com')).to.be.an.instanceOf(
			fetchMock.config.Request
		);
		expect(new Response()).to.be.an.instanceOf(fetchMock.config.Response);
	});
});
