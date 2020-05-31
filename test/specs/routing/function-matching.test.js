const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('function matching', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match using custom function', async () => {
		fm.mock((url, opts) => {
			return (
				url.indexOf('logged-in') > -1 &&
				opts &&
				opts.headers &&
				opts.headers.authorized === true
			);
		}, 200).catch();

		await fm.fetchHandler('http://a.com/12345', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/logged-in');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/logged-in', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match using custom function using request body', async () => {
		fm.mock((url, opts) => opts.body === 'a string', 200).catch();
		await fm.fetchHandler('http://a.com/logged-in');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/logged-in', {
			method: 'post',
			body: 'a string',
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match using custom function with Request', async () => {
		fm.mock((url, options) => {
			return url.indexOf('logged-in') > -1 && options.headers.authorized;
		}, 200).catch();

		await fm.fetchHandler(
			new fm.config.Request('http://a.com/logged-in', {
				headers: { authorized: 'true' },
			})
		);
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match using custom function with Request with unusual options', async () => {
		// as node-fetch does not try to emulate all the WHATWG standards, we can't check for the
		// same properties in the browser and nodejs
		const propertyToCheck = new fm.config.Request('http://example.com').cache
			? 'credentials'
			: 'compress';
		const valueToSet = propertyToCheck === 'credentials' ? 'include' : false;

		fm.mock(
			(url, options, request) => request[propertyToCheck] === valueToSet,
			200
		).catch();

		await fm.fetchHandler(new fm.config.Request('http://a.com/logged-in'));
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler(
			new fm.config.Request('http://a.com/logged-in', {
				[propertyToCheck]: valueToSet,
			})
		);
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match using custom function alongside other matchers', async () => {
		fm.mock('end:profile', 200, {
			functionMatcher: (url, opts) => {
				return opts && opts.headers && opts.headers.authorized === true;
			},
		}).catch();

		await fm.fetchHandler('http://a.com/profile');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/not', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/profile', {
			headers: { authorized: true },
		});
		expect(fm.calls(true).length).to.equal(1);
	});
});
