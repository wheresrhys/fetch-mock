const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('header matching', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('not match when headers not present', async () => {
		fm.mock(
			{
				headers: { a: 'b' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).to.equal(0);
	});

	it("not match when headers don't match", async () => {
		fm.mock(
			{
				headers: { a: 'b' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: 'c' },
		});
		expect(fm.calls(true).length).to.equal(0);
	});

	it('match simple headers', async () => {
		fm.mock(
			{
				headers: { a: 'b' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: 'b' },
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('be case insensitive', async () => {
		fm.mock(
			{
				headers: { a: 'b' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { A: 'b' },
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match multivalue headers', async () => {
		fm.mock(
			{
				headers: { a: ['b', 'c'] },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: ['b', 'c'] },
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('not match partially satisfied multivalue headers', async () => {
		fm.mock(
			{
				headers: { a: ['b', 'c', 'd'] },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: ['b', 'c'] },
		});
		expect(fm.calls(true).length).to.equal(0);
	});

	it('match multiple headers', async () => {
		fm.mock(
			{
				headers: { a: 'b', c: 'd' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: 'b', c: 'd' },
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('not match unsatisfied multiple headers', async () => {
		fm.mock(
			{
				headers: { a: 'b', c: 'd' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: { a: 'b' },
		});
		expect(fm.calls(true).length).to.equal(0);
	});

	it('match Headers instance', async () => {
		fm.mock(
			{
				headers: { a: 'b' },
			},
			200
		).catch();

		await fm.fetchHandler('http://a.com/', {
			headers: new fm.config.Headers({ a: 'b' }),
		});
		expect(fm.calls(true).length).to.equal(1);
	});

	it('match custom Headers instance', async () => {
		const customHeaderInstance = fm.createInstance();
		customHeaderInstance.config.Headers = class {
			constructor(obj) {
				this.obj = obj;
			}
			*[Symbol.iterator]() {
				yield ['a', 'b'];
			}
			has() {
				return true;
			}
		};

		customHeaderInstance
			.mock(
				{
					headers: { a: 'b' },
				},
				200
			)
			.catch();

		await customHeaderInstance.fetchHandler('http://a.com/', {
			headers: new customHeaderInstance.config.Headers({ a: 'b' }),
		});
		expect(customHeaderInstance.calls(true).length).to.equal(1);
	});

	it('can be used alongside function matchers', async () => {
		fm.mock((url) => /person/.test(url), 200, {
			headers: { a: 'b' },
		}).catch();

		await fm.fetchHandler('http://domain.com/person');
		expect(fm.calls(true).length).to.equal(0);
		await fm.fetchHandler('http://domain.com/person', {
			headers: { a: 'b' },
		});
		expect(fm.calls(true).length).to.equal(1);
	});
});
