const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;

describe('sendAsJson', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	it('convert object responses to json by default', async () => {
		fm.mock('*', { an: 'object' });
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-type')).to.equal('application/json');
	});

	it("don't convert when configured false", async () => {
		fm.config.sendAsJson = false;
		fm.mock('*', { an: 'object' });
		const res = await fm.fetchHandler('http://it.at.there');
		// can't check for existence as the spec says, in the browser, that
		// a default value should be set
		expect(res.headers.get('content-type')).not.to.equal('application/json');
	});

	it('local setting can override to true', async () => {
		fm.config.sendAsJson = false;
		fm.mock('*', { an: 'object' }, { sendAsJson: true });
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-type')).to.equal('application/json');
	});

	it('local setting can override to false', async () => {
		fm.config.sendAsJson = true;
		fm.mock('*', { an: 'object' }, { sendAsJson: false });
		const res = await fm.fetchHandler('http://it.at.there');
		// can't check for existence as the spec says, in the browser, that
		// a default value should be set
		expect(res.headers.get('content-type')).not.to.equal('application/json');
	});
});
