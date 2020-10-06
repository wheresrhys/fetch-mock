const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;

describe('overwriteRoutes', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	it('error on duplicate routes by default', async () => {
		expect(() =>
			fm.mock('http://a.com', 200).mock('http://a.com', 300)
		).to.throw();
	});

	it('allow overwriting existing route', async () => {
		fm.config.overwriteRoutes = true;
		expect(() =>
			fm.mock('http://a.com', 200).mock('http://a.com', 300)
		).not.to.throw();

		const res = await fm.fetchHandler('http://a.com');
		expect(res.status).to.equal(300);
	});

	it('allow overwriting existing route, regex matcher', async () => {
		fm.config.overwriteRoutes = true;
		expect(() => fm.mock(/a\.com/, 200).mock(/a\.com/, 300)).not.to.throw();

		const res = await fm.fetchHandler('http://a.com');
		expect(res.status).to.equal(300);
	});

	it('allow adding additional routes with same matcher', async () => {
		fm.config.overwriteRoutes = false;
		expect(() =>
			fm.mock('http://a.com', 200, { repeat: 1 }).mock('http://a.com', 300)
		).not.to.throw();

		const res = await fm.fetchHandler('http://a.com');
		expect(res.status).to.equal(200);
		const res2 = await fm.fetchHandler('http://a.com');
		expect(res2.status).to.equal(300);
	});
});
