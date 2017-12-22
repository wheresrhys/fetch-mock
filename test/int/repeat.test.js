
			describe('strict matching', function () {

				it('can expect all routes to have been called', function () {

					fetchMock
						.mock('http://it.at.there1/', 200)
						.mock('http://it.at.there2/', 200)

					fetch('http://it.at.there1/')
					expect(fetchMock.called()).to.be.true;
					expect(fetchMock.done()).to.be.false;
					fetch('http://it.at.there2/')
					expect(fetchMock.done()).to.be.true;
				});

				it('can expect a route to have been called exactly n times', function () {

					fetchMock
						.mock('http://it.at.there1/', 200, {repeat: 3})

					fetch('http://it.at.there1/')
					expect(fetchMock.called()).to.be.true;
					expect(fetchMock.done()).to.be.false;
					expect(fetchMock.called('http://it.at.there1/')).to.be.true;
					expect(fetchMock.done('http://it.at.there1/')).to.be.false;
					fetch('http://it.at.there1/')
					expect(fetchMock.done()).to.be.false;
					expect(fetchMock.done('http://it.at.there1/')).to.be.false;
					fetch('http://it.at.there1/');
					expect(fetchMock.done()).to.be.true;
					expect(fetchMock.done('http://it.at.there1/')).to.be.true;
				});

				it('can expect all routes to have been called m, n ... times', function () {
					fetchMock
						.mock('http://it.at.there1/', 200, {repeat: 2})
						.mock('http://it.at.there2/', 200, {repeat: 2})

					fetch('http://it.at.there1/')
					expect(fetchMock.done()).to.be.false;
					expect(fetchMock.done('http://it.at.there1/')).to.be.false;
					expect(fetchMock.done('http://it.at.there2/')).to.be.false;
					fetch('http://it.at.there1/')
					expect(fetchMock.done()).to.be.false;
					expect(fetchMock.done('http://it.at.there1/')).to.be.true;
					expect(fetchMock.done('http://it.at.there2/')).to.be.false;
					fetch('http://it.at.there2/')
					expect(fetchMock.done()).to.be.false;
					expect(fetchMock.done('http://it.at.there1/')).to.be.true;
					expect(fetchMock.done('http://it.at.there2/')).to.be.false;
					fetch('http://it.at.there2/');
					expect(fetchMock.done()).to.be.true;
					expect(fetchMock.done('http://it.at.there1/')).to.be.true;
					expect(fetchMock.done('http://it.at.there2/')).to.be.true;
				});

				describe('strict matching shorthands', () => {
					it(`has once shorthand method`, () => {
						sinon.stub(fetchMock, 'mock');
						fetchMock['once']('a', 'b');
						fetchMock['once']('a', 'b', {opt: 'c'});
						expect(fetchMock.mock.calledWith('a', 'b', {repeat: 1})).to.be.true;
						expect(fetchMock.mock.calledWith('a', 'b', {opt: 'c', repeat: 1})).to.be.true;
						fetchMock.mock.restore();
					});

					'get,post,put,delete,head,patch'.split(',')
						.forEach(method => {
							it(`has once shorthand for ${method.toUpperCase()}`, () => {
								sinon.stub(fetchMock, 'mock');
								fetchMock[method + 'Once']('a', 'b');
								fetchMock[method + 'Once']('a', 'b', {opt: 'c'});
								expect(fetchMock.mock.calledWith('a', 'b', {method: method.toUpperCase(), repeat: 1})).to.be.true;
								expect(fetchMock.mock.calledWith('a', 'b', {opt: 'c', method: method.toUpperCase(), repeat: 1})).to.be.true;
								fetchMock.mock.restore();
							});
						})
				});


				it('won\'t mock if route already matched enough times', function () {
					fetchMock
						.mock('http://it.at.there1/', 200, {repeat: 1})

					return fetch('http://it.at.there1/')
						.then(res => {
							expect(res.status).to.equal(200);
						})
						.then(() => fetch('http://it.at.there1/'))
						.then(() => {
							expect(true).to.be.false;
						}, () => {
							expect(true).to.be.true;
						})
				});

				it('falls back to second route if first route already matched enough times', function () {
					fetchMock
						.mock('http://it.at.there1/', 404, {repeat: 1})
						.mock('http://it.at.there1/', 200);

					return fetch('http://it.at.there1/')
						.then(res => {
							expect(res.status).to.equal(404);
						})
						.then(() => fetch('http://it.at.there1/'))
						.then(res => {
							expect(res.status).to.equal(200);
						})
				});

				it('reset() resets count', () => {
					fetchMock
						.once('http://it.at.there1/', 200);
					return fetch('http://it.at.there1/')
						.then(() => {
							expect(fetchMock.done()).to.be.true;
							fetchMock.reset();
							expect(fetchMock.done()).to.be.false;
							expect(fetchMock.done('http://it.at.there1/')).to.be.false;
							return fetch('http://it.at.there1/')
								.then(() => {
									expect(fetchMock.done()).to.be.true;
									expect(fetchMock.done('http://it.at.there1/')).to.be.true;
								})
						});
				})

				it('logs unmatched calls', function () {
					sinon.spy(console, 'warn')
					fetchMock
						.mock('http://it.at.there1/', 200)
						.mock('http://it.at.there2/', 200, {repeat: 2})

					fetch('http://it.at.there2/')
					fetchMock.done()
					expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true;
					expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.true;
					console.warn.reset();
					fetchMock.done('http://it.at.there1/')
					expect(console.warn.calledWith('Warning: http://it.at.there1/ not called')).to.be.true;
					expect(console.warn.calledWith('Warning: http://it.at.there2/ only called 1 times, but 2 expected')).to.be.false;
					console.warn.restore();
				});

			});
		});
