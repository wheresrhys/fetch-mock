const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const { fetchMock } = testGlobals;
describe('repeat and done()', () => {
	let fm;
	before(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('can expect a route to be called', async () => {
		fm.mock('http://a.com/', 200);

		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.false;
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.true;
		expect(fm.done('http://a.com/')).to.be.true;
	});

	it('can expect a route to be called n times', async () => {
		fm.mock('http://a.com/', 200, { repeat: 2 });

		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.false;
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.true;
		expect(fm.done('http://a.com/')).to.be.true;
	});

	it('regression: can expect an un-normalized url to be called n times', async () => {
		fm.mock('http://a.com/', 200, { repeat: 2 });
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.false;
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.true;
	});

	it('can expect multiple routes to have been called', async () => {
		fm.mock('http://a.com/', 200, {
			repeat: 2,
		}).mock('http://b.com/', 200, { repeat: 2 });

		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.false;
		expect(fm.done('http://b.com/')).to.be.false;
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.true;
		expect(fm.done('http://b.com/')).to.be.false;
		fm.fetchHandler('http://b.com/');
		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.true;
		expect(fm.done('http://b.com/')).to.be.false;
		fm.fetchHandler('http://b.com/');
		expect(fm.done()).to.be.true;
		expect(fm.done('http://a.com/')).to.be.true;
		expect(fm.done('http://b.com/')).to.be.true;
	});

	// todo more tests for filtering
	it('`done` filters on match types', async () => {
		fm.once('http://a.com/', 200)
			.once('http://b.com/', 200)
			.once('http://c.com/', 200)
			.catch();

		await fm.fetchHandler('http://a.com/');
		await fm.fetchHandler('http://b.com/');
		expect(fm.done()).to.be.false;
		expect(fm.done(true)).to.be.false;
		expect(fm.done('http://a.com/')).to.be.true;
		expect(fm.done('http://b.com/')).to.be.true;
		expect(fm.done('http://c.com/')).to.be.false;
	});

	it("can tell when done if using '*'", () => {
		fm.mock('*', '200');
		fm.fetchHandler('http://a.com');
		expect(fm.done()).to.be.true;
	});

	it('can tell when done if using begin:', () => {
		fm.mock('begin:http', '200');
		fm.fetchHandler('http://a.com');
		expect(fm.done()).to.be.true;
	});

	it("won't mock if route already matched enough times", async () => {
		fm.mock('http://a.com/', 200, { repeat: 1 });

		await fm.fetchHandler('http://a.com/');
		try {
			await fm.fetchHandler('http://a.com/');
			expect(true).to.be.false;
		} catch (err) {}
	});

	it('falls back to second route if first route already done', async () => {
		fm.mock('http://a.com/', 404, {
			repeat: 1,
		}).mock('http://a.com/', 200, { overwriteRoutes: false });

		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).to.equal(404);

		const res2 = await fm.fetchHandler('http://a.com/');
		expect(res2.status).to.equal(200);
	});

	it('resetHistory() resets count', async () => {
		fm.mock('http://a.com/', 200, { repeat: 1 });
		await fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.true;
		fm.resetHistory();
		expect(fm.done()).to.be.false;
		expect(fm.done('http://a.com/')).to.be.false;
		await fm.fetchHandler('http://a.com/');
		expect(fm.done()).to.be.true;
		expect(fm.done('http://a.com/')).to.be.true;
	});

	it('logs unmatched calls', () => {
			sinon.spy(console, 'warn'); //eslint-disable-line
		fm.mock('http://a.com/', 200).mock('http://b.com/', 200, {
			repeat: 2,
		});

		fm.fetchHandler('http://b.com/');
		fm.done();
		expect(console.warn.calledWith('Warning: http://a.com/ not called')).to.be.true; //eslint-disable-line
		expect(
			console.warn.calledWith(
				'Warning: http://b.com/ only called 1 times, but 2 expected'
			)
			).to.be.true; //eslint-disable-line
			console.warn.resetHistory(); //eslint-disable-line
		fm.done('http://a.com/');
		expect(console.warn.calledWith('Warning: http://a.com/ not called')).to.be.true; //eslint-disable-line
		expect(
			console.warn.calledWith(
				'Warning: http://b.com/ only called 1 times, but 2 expected'
			)
			).to.be.false; //eslint-disable-line
			console.warn.restore(); //eslint-disable-line
	});

	describe('sandbox isolation', () => {
		it("doesn't propagate to children of global", () => {
			fm.mock('http://a.com/', 200, { repeat: 1 });

			const sb1 = fm.sandbox();

			fm.fetchHandler('http://a.com/');

			expect(fm.done()).to.be.true;
			expect(sb1.done()).to.be.false;

			expect(() => sb1.fetchHandler('http://a.com/')).not.to.throw();
		});

		it("doesn't propagate to global from children", () => {
			fm.mock('http://a.com/', 200, { repeat: 1 });

			const sb1 = fm.sandbox();

			sb1.fetchHandler('http://a.com/');

			expect(fm.done()).to.be.false;
			expect(sb1.done()).to.be.true;

			expect(() => fm.fetchHandler('http://a.com/')).not.to.throw();
		});

		it("doesn't propagate to children of sandbox", () => {
			const sb1 = fm.sandbox().mock('http://a.com/', 200, { repeat: 1 });

			const sb2 = sb1.sandbox();

			sb1.fetchHandler('http://a.com/');

			expect(sb1.done()).to.be.true;
			expect(sb2.done()).to.be.false;

			expect(() => sb2.fetchHandler('http://a.com/')).not.to.throw();
		});

		it("doesn't propagate to sandbox from children", () => {
			const sb1 = fm.sandbox().mock('http://a.com/', 200, { repeat: 1 });

			const sb2 = sb1.sandbox();

			sb2.fetchHandler('http://a.com/');

			expect(sb1.done()).to.be.false;
			expect(sb2.done()).to.be.true;

			expect(() => sb1.fetchHandler('http://a.com/')).not.to.throw();
		});

		it('Allow overwriting routes when using multiple function matchers', async () => {
			const matcher1 = () => true;

			const matcher2 = () => true;

			const sb = fm.sandbox();

			expect(() =>
				sb.postOnce(matcher1, 200).postOnce(matcher2, 200)
			).not.to.throw();

			await sb('https://example.com/', { method: 'POST' });
			expect(sb.done()).to.be.false;
			expect(sb.done(matcher1)).to.be.true;
			expect(sb.done(matcher2)).to.be.false;
			await sb('https://example.com/', { method: 'POST' });

			expect(sb.done()).to.be.true;
			expect(sb.done(matcher1)).to.be.true;
			expect(sb.done(matcher2)).to.be.true;
		});
	});
});
