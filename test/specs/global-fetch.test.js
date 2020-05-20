const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const { fetchMock, theGlobal } = testGlobals;

describe('use with global fetch', () => {
	let originalFetch;

	const expectToBeStubbed = (yes = true) => {
		expect(theGlobal.fetch).to.equal(
			yes ? fetchMock.fetchHandler : originalFetch
		);
		expect(theGlobal.fetch).not.to.equal(
			yes ? originalFetch : fetchMock.fetchHandler
		);
	};

	beforeEach(() => {
		originalFetch = theGlobal.fetch = sinon.stub().returns(Promise.resolve());
	});
	afterEach(fetchMock.restore);

	it('replaces global fetch when mock called', () => {
		fetchMock.mock('*', 200);
		expectToBeStubbed();
	});

	it('replaces global fetch when catch called', () => {
		fetchMock.catch(200);
		expectToBeStubbed();
	});

	it('replaces global fetch when spy called', () => {
		fetchMock.spy();
		expectToBeStubbed();
	});

	it('restores global fetch after a mock', () => {
		fetchMock.mock('*', 200).restore();
		expectToBeStubbed(false);
	});

	it('restores global fetch after a complex mock', () => {
		fetchMock.mock('a', 200).mock('b', 200).spy().catch(404).restore();
		expectToBeStubbed(false);
	});

	it('not call default fetch when in mocked mode', async () => {
		fetchMock.mock('*', 200);

		await theGlobal.fetch('http://a.com');
		expect(originalFetch).not.called;
	});
});
