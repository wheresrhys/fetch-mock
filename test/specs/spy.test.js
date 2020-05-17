const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock, theGlobal } = testGlobals;
describe('spy()', () => {
	it('when mocking globally, spy falls through to global fetch', async () => {
		const originalFetch = theGlobal.fetch;
		const fetchSpy = sinon.stub().returns(Promise.resolve('example'));

		theGlobal.fetch = fetchSpy;

		fetchMock.spy();

		await theGlobal.fetch('http://a.com/', { method: 'get' });
		expect(fetchSpy).calledWith('http://a.com/', { method: 'get' });
		fetchMock.restore();
		theGlobal.fetch = originalFetch;
	});

	it('when mocking locally, spy falls through to configured fetch', async () => {
		const fetchSpy = sinon.stub().returns(Promise.resolve('dummy'));

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy();
		await fm.fetchHandler('http://a.com/', { method: 'get' });
		expect(fetchSpy).calledWith('http://a.com/', { method: 'get' });
		fm.restore();
	});

	it('can restrict spying to a route', async () => {
		const fetchSpy = sinon.stub().returns(Promise.resolve('dummy'));

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy({ url: 'http://a.com/', method: 'get' });
		await fm.fetchHandler('http://a.com/', { method: 'get' });
		expect(fetchSpy).calledWith('http://a.com/', { method: 'get' });
		expect(() =>
			fm.fetchHandler('http://b.com/', { method: 'get' })
		).to.throw();
		expect(() =>
			fm.fetchHandler('http://a.com/', { method: 'post' })
		).to.throw();
		fm.restore();
	});
});
