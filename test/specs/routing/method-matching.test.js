const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('method matching', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match any method by default', async () => {
		fm.mock('http://a.com/', 200).catch();

		await fm.fetchHandler('http://a.com/', { method: 'GET' });
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('http://a.com/', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(2);
	});

	it('configure an exact method to match', async () => {
		fm.mock('http://a.com/', 200, { method: 'POST' }).catch();

		await fm.fetchHandler('http://a.com/', { method: 'GET' });
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match implicit GET', async () => {
		fm.mock('http://a.com/', 200, { method: 'GET' }).catch();

		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('be case insensitive', async () => {
		fm.mock('http://a.com/', 200, { method: 'POST' })
			.mock('http://it.at.where/', 200, { method: 'patch' })
			.catch();

		await fm.fetchHandler('http://a.com/', { method: 'post' });
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('http://it.at.where/', { method: 'PATCH' });
		expect(fm.calls(true).length).to.equal(2);
	});

	it('can be used alongside function matchers', async () => {
		fm.mock((url) => /person/.test(url), 200, { method: 'POST' }).catch();

		await fm.fetchHandler('http://domain.com/person');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://domain.com/person', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(1);
	});
});
