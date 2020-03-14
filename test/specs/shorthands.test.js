const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');


const testChainableMethod = (getFetchMock, method, args = []) => {
	it(`${method}() is chainable`, () => {
		expect(getFetchMock()[method](...args)).to.equal(getFetchMock());
	});

	it(`${method}() has "this"`, () => {
		sinon.spy(getFetchMock(), method);
		getFetchMock()[method](...args);
		expect(getFetchMock()[method].lastCall.thisValue).to.equal(getFetchMock());
		getFetchMock()[method].restore();
	});
};


module.exports = fetchMock => {
	describe('shorthands', () => {
				let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});
		afterEach(() => fm.restore());

			it('has once() shorthand method', () => {
				sinon.spy(fm, 'compileRoute');
				fm.once('a', 'b');
				fm.once('c', 'd', { opt: 'e' });
				expect(
					fm.compileRoute.calledWith([
						'a',
						'b',
						{
							repeat: 1
						}
					])
				).to.be.true;
				expect(
					fm.compileRoute.calledWith([
						'c',
						'd',
						{
							opt: 'e',
							repeat: 1
						}
					])
				).to.be.true;
				fm.compileRoute.restore();
			});


			it('has any() shorthand method', () => {
				sinon.spy(fm, 'compileRoute');
				fm.any('a', { opt: 'b' });
				expect(
					fm.compileRoute.calledWith([
						{},
						'a',
						{
							opt: 'b',
						}
					])
				).to.be.true;
				fm.compileRoute.restore();
			});

		describe('method shorthands', () => {
			['get',
			// 'post',
			// 'put',
			// 'delete',
			// 'head',
			// 'patch'
			].forEach(method => {
				describe(method.toUpperCase(), () => {

				it(`has ${method}() shorthand`, () => {
					sinon.spy(fm, 'compileRoute');
					fm[method]('a', 'b');
					fm[method]('c', 'd', { opt: 'e' });
					expect(fm.compileRoute).calledWith([
						'a',
						'b',
						{
							method: method
						}
					]);
					expect(fm.compileRoute).calledWith([
						'c',
						'd',
						{
							opt: 'e',
							method: method
						}
					]);
					fm.compileRoute.restore();
					fm.restore();
				});

				testChainableMethod(() => fm, method, [/a/, 200]);

				it(`has ${method}Once() shorthand`, () => {
					sinon.spy(fm, 'compileRoute');
					fm[method + 'Once']('a', 'b');
					fm[method + 'Once']('c', 'd', { opt: 'e' });
					expect(
						fm.compileRoute.calledWith([
							'a',
							'b',
							{
								method: method,
								repeat: 1
							}
						])
					).to.be.true;
					expect(
						fm.compileRoute.calledWith([
							'c',
							'd',
							{
								opt: 'e',
								method: method,
								repeat: 1
							}
						])
					).to.be.true;
					fm.compileRoute.restore();
				});


				testChainableMethod(() => fm, `${method}Once`, [/a/, 200]);

				it(`has ${method}Any() shorthand`, () => {
					sinon.spy(fm, 'compileRoute');
					fm[method + 'Any']('a', { opt: 'b' });
					expect(
						fm.compileRoute.calledWith([
							{},
							'a',
							{
								opt: 'b',
								method: method,
							}
						])
					).to.be.true;
					fm.compileRoute.restore();
				});

				testChainableMethod(() => fm, `${method}Any`, [200]);
				})
			});
		});



	})
}
