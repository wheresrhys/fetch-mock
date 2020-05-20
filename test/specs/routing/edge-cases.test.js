const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('edge cases', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match relative urls', async () => {
		fm.mock('/a.com/', 200).catch();

		await fm.fetchHandler('/a.com/');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match relative urls with dots', async () => {
		fm.mock('/it.at/there/', 200).catch();

		await fm.fetchHandler('/it.at/not/../there/');
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('./it.at/there/');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match absolute urls with dots', async () => {
		fm.mock('http://it.at/there/', 200).catch();

		await fm.fetchHandler('http://it.at/not/../there/');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match when called with Request', async () => {
		fm.post('http://a.com/', 200).catch();

		await fm.fetchHandler(
			new fm.config.Request('http://a.com/', { method: 'POST' })
		);
		expect(fm.calls(true).length).to.equal(1);
	});

	it('allow routes only differing in query strings', async () => {
		expect(() => {
			fm.get(`/xyz/abc?id=486726&id=486727`, 200);
			fm.get(`/xyz/abc?id=486727`, 200);
		}).not.to.throw();
	});

	it('express match full url', async () => {
		fm.mock('express:/apps/:id', 200).catch();

		await fm.fetchHandler('https://api.example.com/apps/abc');
		expect(fm.calls(true).length).to.equal(1);
	});
	it('setup routes correctly when using object definitions', async () => {
		fm.get({
			matcher: `express:/:var`,
			response: 200,
		}).put({
			matcher: `express:/:var`,
			response: 201,
			overwriteRoutes: false,
		});

		const { status } = await fm.fetchHandler('https://api.example.com/lala', {
			method: 'put',
		});
		// before fixing this test it was returning 200 for the put request
		// because both teh .get() and .put() calls were failing to correctly
		// add the choice of method to the route config
		expect(status).to.equal(201);
	});
});
