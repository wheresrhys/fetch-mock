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
		fm.mock('*', 200).catch();

		await fm.fetchHandler('http://a.com/', { method: 'GET' });
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('http://a.com/', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(2);
	});

	it('configure an exact method to match', async () => {
		fm.mock({ method: 'POST' }, 200).catch();

		await fm.fetchHandler('http://a.com/', { method: 'GET' });
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match implicit GET', async () => {
		fm.mock({ method: 'GET' }, 200).catch();

		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('be case insensitive', async () => {
		fm.mock({ method: 'POST' }, 200).mock({ method: 'patch' }, 200).catch();

		await fm.fetchHandler('http://a.com/', { method: 'post' });
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('http://a.com/', { method: 'PATCH' });
		expect(fm.calls(true).length).to.equal(2);
	});

	it('can be used alongside function matchers', async () => {
		fm.mock(
			{
				method: 'POST',
				functionMatcher: (url) => /a\.com/.test(url),
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com', { method: 'POST' });
		expect(fm.calls(true).length).to.equal(1);
	});
});
