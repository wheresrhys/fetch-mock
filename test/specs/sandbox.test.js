const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock, theGlobal) => {

	describe('sandbox', () => {
		let originalFetch;

		before(() => {
			originalFetch = theGlobal.fetch = sinon.stub().returns(Promise.resolve('dummy'));
		});

		it('return function', () => {
			const sbx = fetchMock.sandbox();
			expect(typeof sbx).to.equal('function');
		});

		it('port settings from parent instance', () => {
			const sbx = fetchMock.sandbox();
			expect(sbx.config).to.eql(fetchMock.config)
		});

		it('implement full fetch-mock api', () => {
			const sbx = fetchMock.sandbox();
			for (let key in fetchMock) {
				expect(typeof sbx[key]).to.equal(typeof fetchMock[key]);
			}
		});

		it('delegate to its own fetch handler', async () => {
			const sbx = fetchMock
				.sandbox()
				.mock('http://domain.url', 200);

			sinon.stub(sbx, 'fetchHandler');

			sbx('http://domain.url')
			expect(sbx.fetchHandler).calledWith('http://domain.url')
		});

		it('don\'t interfere with global fetch', () => {
			const sbx = fetchMock
				.sandbox()
				.mock('http://domain.url', 200)

			expect(theGlobal.fetch).to.equal(originalFetch);
			expect(theGlobal.fetch).not.to.equal(sbx);
		});

		it('don\'t interfere with global fetch-mock', async () => {
			const sbx = fetchMock
				.sandbox()
				.mock('http://domain.url', 200)
				.catch(302)

			fetchMock
				.mock('http://domain2.url', 200)
				.catch(301)

			expect(theGlobal.fetch).to.equal(fetchMock.fetchHandler);
			expect(fetchMock.fetchHandler).not.to.equal(sbx);
			expect(fetchMock.fallbackResponse).not.to.equal(sbx.fallbackResponse)
			expect(fetchMock.routes).not.to.equal(sbx.routes)

			const [sandboxed, globally] = await Promise.all([
				sbx('http://domain.url'),
				fetch('http://domain2.url')
			])

			expect(sandboxed.status).to.equal(200);
			expect(globally.status).to.equal(200);
			expect(sbx.called('http://domain.url')).to.be.true;
			expect(sbx.called('http://domain2.url')).to.be.false;
			expect(fetchMock.called('http://domain2.url')).to.be.true;
			expect(fetchMock.called('http://domain.url')).to.be.false;
			expect(sbx.called('http://domain.url')).to.be.true;
			fetchMock.restore();
		});

		it('don\'t interfere with other sandboxes', async () => {
			const sbx = fetchMock
				.sandbox()
				.mock('http://domain.url', 200)
				.catch(301)

			const sbx2 = fetchMock
				.sandbox()
				.mock('http://domain2.url', 200)
				.catch(302)

			expect(sbx2).not.to.equal(sbx);
			expect(sbx2.fallbackResponse).not.to.equal(sbx.fallbackResponse)
			expect(sbx2.routes).not.to.equal(sbx.routes)

			const [res1, res2] = await Promise.all([
				sbx('http://domain.url'),
				sbx2('http://domain2.url')
			])
			expect(res1.status).to.equal(200);
			expect(res2.status).to.equal(200);
			expect(sbx.called('http://domain.url')).to.be.true;
			expect(sbx.called('http://domain2.url')).to.be.false;
			expect(sbx2.called('http://domain2.url')).to.be.true;
			expect(sbx2.called('http://domain.url')).to.be.false;
		});

		it('can be restored', async () => {
			const sbx = fetchMock
				.sandbox()
				.get('https://api.resin.io/foo', 200);

			const res = await sbx('https://api.resin.io/foo')
			expect(res.status).to.equal(200);

			sbx
				.restore()
				.get('https://api.resin.io/foo', 500);

			const res2 = await sbx('https://api.resin.io/foo');
			expect(res2.status).to.equal(500);
		});

		it('can \'fork\' existing sandboxes or the global fetchMock', () => {
			const sbx1 = fetchMock
				.sandbox()
				.mock(/a/, 200)
				.catch(300)

			const sbx2 = sbx1
				.sandbox()
				.mock(/b/, 200)
				.catch(400)

			expect(sbx1.routes.length).to.equal(1);
			expect(sbx2.routes.length).to.equal(2);
			expect(sbx1.fallbackResponse).to.equal(300);
			expect(sbx2.fallbackResponse).to.equal(400);
			sbx1.restore();
			expect(sbx1.routes.length).to.equal(0);
			expect(sbx2.routes.length).to.equal(2);
		})

		it('error if spy() is called and no fetch defined in config', () => {
			expect(() => fetchMock.sandbox().spy()).to.throw();
		});

		it('don\'t error if spy() is called and fetch defined in config', () => {
			const fm = fetchMock.sandbox();
			fm.config.fetch = originalFetch;
			expect(() => fm.spy()).not.to.throw();
		});
	});
}
