const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock, theGlobal) => {
	describe('use with global fetch', () => {
		let originalFetch;
		before(() => {
			originalFetch = theGlobal.fetch = sinon.stub().returns(Promise.resolve('dummy'));
		});
		afterEach(fetchMock.restore);

		it('replaces global fetch when mock called', () => {
			fetchMock.mock(/a/, 200);
			expect(theGlobal.fetch).to.equal(fetchMock.fetchHandler);
		});

		it('replaces global fetch when catch called', () => {
			fetchMock.catch(200);
			expect(theGlobal.fetch).to.equal(fetchMock.fetchHandler);
		});

		it('replaces global fetch when spy called', () => {
			fetchMock.spy();
			expect(theGlobal.fetch).to.equal(fetchMock.fetchHandler);
		});

		it('restores global fetch after a mock', () => {
			fetchMock.mock(/a/, 200).restore()
			expect(theGlobal.fetch).to.equal(originalFetch);
		});

		it('restores global fetch after a complex mock', () => {
			fetchMock
				.mock(/a/, 200)
				.mock(/b/, 200)
				.spy()
				.catch(404)
				.restore()
			expect(theGlobal.fetch).to.equal(originalFetch);
		});

		it('not call default fetch when in mocked mode', async () => {
			fetchMock
				.mock(/a/, 200);

			await theGlobal.fetch('http://a.com')
			expect(originalFetch).not.called;
		});

		it('spy falls through to default fetch', async () => {
			fetchMock
				.spy();

			await theGlobal.fetch('http://a.com', { method: 'get' })
			expect(originalFetch).calledWith('http://a.com', { method: 'get' });
		});

		it('spy falls through to default fetch with Request', async () => {
			fetchMock
				.spy();

			const headers = { 'Content-type': 'application/json', 'AUTHORIZATION': `Bearer Dummy` };
			const request = new Request('http://a.com', {
				method: 'GET',
				headers: headers
			});

			await theGlobal.fetch(request)
			expect(originalFetch).calledWith(request);
		});
	});

};
