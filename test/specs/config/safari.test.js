const chai = require('chai');
const expect = chai.expect;

const { fetchMock, theGlobal } = testGlobals;

describe('Safari override', () => {
	beforeEach(() => {
		fetchMock.createInstance();
	});

	it('passes all GET arguments to next function when not under Safari', async () => {
		theGlobal.fetch = async (...args) => {
			expect(args[0]).to.equal('http://mocked.com/');
			expect(args[1]).to.deep.equal({ method: 'GET' });
			return { status: 202 };
		};
		fetchMock.spy('http://mocked.com');
		const res = await fetchMock.fetchHandler('http://mocked.com', {
			method: 'GET',
		});
		expect(res.status).to.equal(202);
		fetchMock.restore();
		delete theGlobal.fetch;
	});

	it('passes all GET arguments to next function under Safari', async () => {
		theGlobal.navigator = { vendor: 'Apple Computer, Inc.' };
		theGlobal.fetch = async (...args) => {
			expect(args[0]).to.equal('http://mocked.com/');
			expect(args[1]).to.deep.equal({ method: 'GET' });
			return { status: 202 };
		};
		fetchMock.spy('http://mocked.com');
		const res = await fetchMock.fetchHandler('http://mocked.com', {
			method: 'GET',
		});
		expect(res.status).to.equal(202);
		fetchMock.restore();
		delete theGlobal.fetch;
	});
});
