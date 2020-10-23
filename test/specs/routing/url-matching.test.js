const chai = require('chai');
const URL = require('whatwg-url');
const expect = chai.expect;

const { fetchMock } = testGlobals;

describe('url matching', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match exact strings', async () => {
		fm.mock('http://a.com/path', 200).catch();
		await fm.fetchHandler('http://a.com/pat');
		await fm.fetchHandler('http://a.com/paths');
		await fm.fetchHandler('http://a.co/path');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('//a.com/path');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match exact strings with relative url', async () => {
		fm.mock('/path', 200).catch();
		await fm.fetchHandler('/pat');
		await fm.fetchHandler('/paths');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('/path');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match exact string against URL object', async () => {
		fm.mock('http://a.com/path', 200).catch();
		const url = new URL.URL('http://a.com/path');
		await fm.fetchHandler(url);
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match using URL object as matcher', async () => {
		const url = new URL.URL('http://a.com/path');
		fm.mock(url, 200).catch();

		await fm.fetchHandler('http://a.com/path');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match begin: keyword', async () => {
		fm.mock('begin:http://a.com/path', 200).catch();

		await fm.fetchHandler('http://b.com/path');
		await fm.fetchHandler('http://a.com/pat');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('http://a.com/paths');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match end: keyword', async () => {
		fm.mock('end:com/path', 200).catch();
		await fm.fetchHandler('http://a.com/paths');
		await fm.fetchHandler('http://a.com/pat');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('http://b.com/path');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match glob: keyword', async () => {
		fm.mock('glob:/its/*/*', 200).catch();
		await fm.fetchHandler('/its/alive');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('/its/a/boy');
		await fm.fetchHandler('/its/a/girl');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match express: keyword', async () => {
		fm.mock('express:/its/:word', 200).catch();

		await fm.fetchHandler('/its/a/boy');
		await fm.fetchHandler('/its/a/girl');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('/its/alive');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match path: keyword', async () => {
		fm.mock('path:/its/:word', 200).catch();

		await fm.fetchHandler('/its/boy');
		await fm.fetchHandler('/its/:word/still');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('/its/:word');
		await fm.fetchHandler('/its/:word?brain=false');
		expect(fm.calls(true).length).to.equal(2);
	});

	it('match wildcard string', async () => {
		fm.mock('*', 200);

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match regular expressions', async () => {
		const rx = /http\:\/\/a\.com\/\d+/;
		fm.mock(rx, 200).catch();

		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://a.com/12345');
		expect(fm.calls(true).length).to.equal(1);
		await fm.fetchHandler('http://a.com/abcde');
		expect(fm.calls(true).length).to.equal(1);
	});

	describe('host normalisation', () => {
		it('match exact pathless urls regardless of trailing slash', async () => {
			fm.mock('http://a.com/', 200).mock('http://b.com', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).to.equal(2);
			await fm.fetchHandler('http://b.com/');
			await fm.fetchHandler('http://b.com');
			expect(fm.calls(true).length).to.equal(4);
		});
		it('match protocol-relative urls with catch-all', async () => {
			fm.any(200).catch();

			await fm.fetchHandler('//a.com/path');
			expect(fm.calls(true).length).to.equal(1);
		});
	});
});
