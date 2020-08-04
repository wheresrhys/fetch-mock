const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('multiple routes', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('property on first parameter', () => {
		fm.mock({ url: 'http://a.com', name: 'my-name' }, 200);
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).to.be.true;
	});

	it('property on first parameter when only one parameter supplied', () => {
		fm.mock({ name: 'my-name', url: 'http://a.com', response: 200 });
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).to.be.true;
	});

	it('property on third parameter', () => {
		fm.mock('http://a.com', 200, { name: 'my-name' });
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).to.be.true;
	});

	it('string in third parameter', () => {
		fm.mock('http://a.com', 200, 'my-name');
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).to.be.true;
	});

	it('string in second parameter if only one other parameters supplied', () => {
		fm.mock({ url: 'http://a.com', response: 200 }, 'my-name');
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).to.be.true;
	});
});
