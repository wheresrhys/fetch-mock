const { expect } = require('chai');
const { fetchMock } = testGlobals;

describe('flushing pending calls', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});
	afterEach(() => fm.restore());

	it('flush resolves if all fetches have resolved', async () => {
		fm.mock('http://one.com/', 200).mock('http://two.com/', 200);
		// no expectation, but if it doesn't work then the promises will hang
		// or reject and the test will timeout
		await fm.flush();
		fetch('http://one.com');
		await fm.flush();
		fetch('http://two.com');
		await fm.flush();
	});

	it('should resolve after fetches', async () => {
		fm.mock('http://example/', 'working!');
		let data;
		fetch('http://example').then(() => (data = 'done'));
		await fm.flush();
		expect(data).to.equal('done');
	});

	describe('response methods', () => {
		it('should resolve after .json() if waitForResponseMethods option passed', async () => {
			fm.mock('http://example/', { a: 'ok' });
			let data;
			fetch('http://example/')
				.then((res) => res.json())
				.then(() => (data = 'done'));

			await fm.flush(true);
			expect(data).to.equal('done');
		});

		it('should resolve after .json() if waitForResponseMethods option passed', async () => {
			fm.mock('http://example/', 'bleurgh');
			let data;
			fetch('http://example/')
				.then((res) => res.json())
				.catch(() => (data = 'done'));

			await fm.flush(true);
			expect(data).to.equal('done');
		});

		it('should resolve after .text() if waitForResponseMethods option passed', async () => {
			fm.mock('http://example/', 'working!');
			let data;
			fetch('http://example/')
				.then((res) => res.text())
				.then(() => (data = 'done'));

			await fm.flush(true);
			expect(data).to.equal('done');
		});
	});

	it('flush waits for unresolved promises', async () => {
		fm.mock('http://one.com/', 200).mock(
			'http://two.com/',
			() => new Promise((res) => setTimeout(() => res(200), 50))
		);

		const orderedResults = [];
		fetch('http://one.com/');
		fetch('http://two.com/');

		setTimeout(() => orderedResults.push('not flush'), 25);

		await fm.flush();
		orderedResults.push('flush');
		expect(orderedResults).to.deep.equal(['not flush', 'flush']);
	});

	it('flush resolves on expected error', async () => {
		fm.mock('http://one.com/', { throws: 'Problem in space' });
		await fm.flush();
	});
});
