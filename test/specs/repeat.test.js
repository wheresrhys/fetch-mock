const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
	describe('repeat and done()', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		it('can expect a route to be called', async () => {
			fm
				.mock('http://it.at.there1/', 200)

			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.false;
			fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.true;
			expect(fm.done('http://it.at.there1/')).to.be.true;
		});

		it('can expect a route to be called n times', async () => {
			fm
				.mock('http://it.at.there1/', 200, {repeat: 2})

			fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.false;
			fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.true;
			expect(fm.done('http://it.at.there1/')).to.be.true;
		});

		it('can expect multiple routes to have been called', async () => {
			fm
				.mock('http://it.at.there1/', 200, {repeat: 2})
				.mock('http://it.at.there2/', 200, {repeat: 2})

			fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.false;
			expect(fm.done('http://it.at.there2/')).to.be.false;
			fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.true;
			expect(fm.done('http://it.at.there2/')).to.be.false;
			fm.fetchHandler('http://it.at.there2/')
			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.true;
			expect(fm.done('http://it.at.there2/')).to.be.false;
			fm.fetchHandler('http://it.at.there2/');
			expect(fm.done()).to.be.true;
			expect(fm.done('http://it.at.there1/')).to.be.true;
			expect(fm.done('http://it.at.there2/')).to.be.true;
		});

		// todo more tests for filtering
		it('`done` filters on match types', async () => {
			fm
				.once('http://it.at.here/', 200)
				.once('http://it.at.there/', 200)
				.once('http://it.at.thereabouts/', 200)
				.catch();

			await fm.fetchHandler('http://it.at.here/', {method: 'get'})
			await fm.fetchHandler('http://it.at.there/', {method: 'get'})
			expect(fm.done()).to.be.false;
			expect(fm.done(true)).to.be.false;
			expect(fm.done('http://it.at.here/')).to.be.true;
			expect(fm.done('http://it.at.thereabouts/')).to.be.false;
		});

		it('won\'t mock if route already matched enough times', async () => {
			fm
				.mock('http://it.at.there1/', 200, {repeat: 1})

			await fm.fetchHandler('http://it.at.there1/');
			try {
				await fm.fetchHandler('http://it.at.there1/');
				expect(true).to.be.false;
			} catch (err) {	}
		});

		it('falls back to second route if first route already done', async () => {
			fm
				.mock('http://it.at.there1/', 404, {repeat: 1})
				.mock('http://it.at.there1/', 200, {overwriteRoutes: false});

			const res = await fm.fetchHandler('http://it.at.there1/');
			expect(res.status).to.equal(404);

			const res2 = await fm.fetchHandler('http://it.at.there1/');
			expect(res2.status).to.equal(200);
		});

		it('reset() resets count', async () => {
			fm
				.mock('http://it.at.there1/', 200, {repeat: 1});
			await fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.true;
			fm.reset();
			expect(fm.done()).to.be.false;
			expect(fm.done('http://it.at.there1/')).to.be.false;
			await fm.fetchHandler('http://it.at.there1/')
			expect(fm.done()).to.be.true;
			expect(fm.done('http://it.at.there1/')).to.be.true;
		})

		it('logs unmatched calls', () => {
			sinon.spy(console, 'warn')
			fm
				.mock('http://it.at.there1/', 200)
				.mock('http://it.at.there2/', 200, {repeat: 2})

			fm.fetchHandler('http://it.at.there2/')
			fm.done()
			expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true;
			expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.true;
			console.warn.reset();
			fm.done('http://it.at.there1/')
			expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true;
			expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.false;
			console.warn.restore();
		});

		describe('strict matching shorthands', () => {
			it(`has once shorthand method`, () => {
				sinon.stub(fm, 'mock');
				fm['once']('a', 'b');
				fm['once']('a', 'b', {opt: 'c'});
				expect(fm.mock.calledWith('a', 'b', {repeat: 1})).to.be.true;
				expect(fm.mock.calledWith('a', 'b', {opt: 'c', repeat: 1})).to.be.true;
				fm.mock.restore();
			});

			'get,post,put,delete,head,patch'.split(',')
				.forEach(method => {
					it(`has once shorthand for ${method.toUpperCase()}`, () => {
						sinon.stub(fm, 'mock');
						fm[method + 'Once']('a', 'b');
						fm[method + 'Once']('a', 'b', {opt: 'c'});
						expect(fm.mock.calledWith('a', 'b', {method: method.toUpperCase(), repeat: 1})).to.be.true;
						expect(fm.mock.calledWith('a', 'b', {opt: 'c', method: method.toUpperCase(), repeat: 1})).to.be.true;
						fm.mock.restore();
					});
				})
		});
	});
}
