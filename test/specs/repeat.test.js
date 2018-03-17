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

		it('`done` filters on method', async () => {
			fm
				.getOnce('http://it.at.here/', 200)
				.postOnce('http://it.at.here/', 200)
				.catch();

			await fm.fetchHandler('http://it.at.here/')
			expect(fm.done()).to.be.false;
			expect(fm.done(true, 'get')).to.be.true;
			expect(fm.done(true, 'post')).to.be.false;
			expect(fm.done('http://it.at.here/', 'get')).to.be.true;
			expect(fm.done('http://it.at.here/', 'post')).to.be.false;
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
			sinon.spy(console, 'warn')//eslint-disable-line
			fm
				.mock('http://it.at.there1/', 200)
				.mock('http://it.at.there2/', 200, {repeat: 2})

			fm.fetchHandler('http://it.at.there2/')
			fm.done()
			expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true; //eslint-disable-line
			expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.true;//eslint-disable-line
			console.warn.reset();//eslint-disable-line
			fm.done('http://it.at.there1/')
			expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true;//eslint-disable-line
			expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.false;//eslint-disable-line
			console.warn.restore();//eslint-disable-line
		});

		describe('sandbox isolation', () => {
			it('doesn\'t propagate to children of global', () => {
				fm
					.mock('http://it.at.there/', 200, {repeat: 1});

				const sb1 = fm.sandbox();

				fm.fetchHandler('http://it.at.there/');

				expect(fm.done()).to.be.true;
				expect(sb1.done()).to.be.false;

				expect(() => sb1.fetchHandler('http://it.at.there/')).not.to.throw();
			});

			it('doesn\'t propagate to global from children', () => {
				fm
					.mock('http://it.at.there/', 200, {repeat: 1});

				const sb1 = fm.sandbox();

				sb1.fetchHandler('http://it.at.there/');

				expect(fm.done()).to.be.false;
				expect(sb1.done()).to.be.true;

				expect(() => fm.fetchHandler('http://it.at.there/')).not.to.throw();
			});

			it('doesn\'t propagate to children of sandbox', () => {
				const sb1 = fm
					.sandbox()
					.mock('http://it.at.there/', 200, {repeat: 1});

				const sb2 = sb1.sandbox();

				sb1.fetchHandler('http://it.at.there/');

				expect(sb1.done()).to.be.true;
				expect(sb2.done()).to.be.false;

				expect(() => sb2.fetchHandler('http://it.at.there/')).not.to.throw();
			});

			it('doesn\'t propagate to sandbox from children', () => {
				const sb1 = fm
					.sandbox()
					.mock('http://it.at.there/', 200, {repeat: 1});

				const sb2 = sb1.sandbox();

				sb2.fetchHandler('http://it.at.there/');

				expect(sb1.done()).to.be.false;
				expect(sb2.done()).to.be.true;

				expect(() => sb1.fetchHandler('http://it.at.there/')).not.to.throw();
			});
		});


		describe('strict matching shorthands', () => {
			it('has once shorthand method', () => {
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
