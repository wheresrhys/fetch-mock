const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('unmatched calls', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('throws if any calls unmatched', async () => {
		fm.mock(/a/, 200);
		expect(() => fm.fetchHandler('http://1')).to.throw();
	});

	it('catch unmatched calls with empty 200 by default', async () => {
		fm.catch();

		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).to.equal(1);
		expect(res.status).to.equal(200);
	});

	it('can catch unmatched calls with custom response', async () => {
		fm.catch({ iam: 'json' });

		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).to.equal(1);
		expect(res.status).to.equal(200);
		expect(await res.json()).to.eql({ iam: 'json' });
	});

	it('can catch unmatched calls with function', async () => {
		fm.catch(() => new fm.config.Response('i am text', { status: 200 }));
		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).to.equal(1);
		expect(res.status).to.equal(200);
		expect(await res.text()).to.equal('i am text');
	});
});
