const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
	describe('routing', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		describe('url matching', () => {
			it('match exact strings', async () => {

				fm
					.mock('http://it.at.there/', 200)
					.catch();

				await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls().matched.length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/abouts');
				await fm.fetchHandler('http://it.at.the');
				expect(fm.calls().matched.length).to.equal(1);
			});

			it('match begin: keyword', async () => {
				fm
					.mock('begin:http://it.at.there', 200)
					.catch();

				await fm.fetchHandler('http://it.at.there');
				expect(fm.calls().matched.length).to.equal(1);
				await fm.fetchHandler('http://it.at.thereabouts');
				expect(fm.calls().matched.length).to.equal(2);
				await fm.fetchHandler('http://it.at.hereabouts');
				expect(fm.calls().matched.length).to.equal(2);
			});

			it('match end: keyword', async () => {
				fm
					.mock('end:there', 200)
					.catch();

				await fm.fetchHandler('http://it.at.there');
				expect(fm.calls().matched.length).to.equal(1);
				await fm.fetchHandler('http://it.at.thereabouts');
				await fm.fetchHandler('http://it.at.here');
				expect(fm.calls().matched.length).to.equal(1);
			});

			it('match glob: keyword', async () => {
				fm
					.mock('glob:/its/*/*', 200)
					.catch();

				await fm.fetchHandler('/its/a/boy');
				await fm.fetchHandler('/its/a/girl');
				expect(fm.calls().matched.length).to.equal(2);
				await fm.fetchHandler('/its/alive');
				expect(fm.calls().matched.length).to.equal(2);
			});

			it('match express: keyword', async () => {
				fm
					.mock('express:/its/:word', 200)
					.catch();

				await fm.fetchHandler('/its/a/boy');
				await fm.fetchHandler('/its/a/girl');
				expect(fm.calls().matched.length).to.equal(0);
				await fm.fetchHandler('/its/alive');
				expect(fm.calls().matched.length).to.equal(1);
			});

			it('match wildcard string', async () => {
				fm
					.mock('*', 200);

				await fm.fetchHandler('http://it.at.there');
				expect(fm.calls().matched.length).to.equal(1);
			});

			it('match regular expressions', async () => {
				const rx = /http\:\/\/it\.at\.there\/\d+/;
				fm
					.mock(rx, 200)
					.catch();

				await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls().matched.length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/12345');
				expect(fm.calls().matched.length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/abcde');
				expect(fm.calls().matched.length).to.equal(1);
			});
		});


		describe('non url matching', () => {

			it('match using custom function', async () => {
				fm
					.mock((url, opts) => {
						return url.indexOf('logged-in') > -1 && opts && opts.headers && opts.headers.authorized === true;
					}, 200)
					.catch();

				await fm.fetchHandler('http://it.at.there/12345', {headers:{authorized: true}});
				expect(fm.calls().matched.length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/logged-in');
				expect(fm.calls().matched.length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/logged-in', {headers:{authorized: true}});
				expect(fm.calls().matched.length).to.equal(1);
			});

			describe('headers', () => {
				it('not match when headers not present', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/')
					expect(fm.calls().matched.length).to.equal(0);
				});

				it('not match when headers don\'t match', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: {a : 'c'}
					})
					expect(fm.calls().matched.length).to.equal(0);
				});

				it('match simple headers', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: {a : 'b'}
					})
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('be case insensitive', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { A : 'b'}
					})
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('match multivalue headers', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: [ 'b', 'c' ]	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a : [ 'b', 'c' ]}
					})
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('not match partially satisfied multivalue headers', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: [ 'b', 'c' , 'd' ]	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a : [ 'b', 'c' ]}
					})
					expect(fm.calls().matched.length).to.equal(0);
				});

				it('match multiple headers', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b', c: 'd'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a : 'b', c: 'd' }
					})
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('not match unsatisfied multiple headers', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b', c: 'd'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a : 'b' }
					})
					expect(fm.calls().matched.length).to.equal(0);
				});

				it('match Headers instance', async () => {
					fm
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: new fm.config.Headers({ a : 'b' })
					})
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('match custom Headers instance', async () => {
					const customHeaderInstance = fm.createInstance();
					customHeaderInstance.config.Headers = class {
						constructor (obj) {
							this.obj = obj;
						}
						raw () {
							return this.obj;
						}
						has () {
							return true
						}
					};

					customHeaderInstance
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b'	}
						})
						.catch();

					await customHeaderInstance.fetchHandler('http://it.at.there/', {
						headers: new customHeaderInstance.config.Headers({ a : 'b' })
					});
					expect(customHeaderInstance.calls().matched.length).to.equal(1);
				});

				it('can be used alongside function matchers', async () => {
					fm
						.mock(url => /person/.test(url), 200, { headers: { a: 'b' }})
						.catch();

					await fm.fetchHandler('http://domain.com/person');
					expect(fm.calls().matched.length).to.equal(0);
					await fm.fetchHandler('http://domain.com/person', {headers: {a: 'b'}});
					expect(fm.calls().matched.length).to.equal(1);
				})

			});

			describe('methods', () => {
				it('match any method by default', async () => {
					fm
						.mock('http://it.at.there/', 200)
						.catch();

					await fm.fetchHandler('http://it.at.there/', {method: 'GET'});
					expect(fm.calls().matched.length).to.equal(1);
					await fm.fetchHandler('http://it.at.there/', {method: 'POST'});
					expect(fm.calls().matched.length).to.equal(2);
				});

				it('configure an exact method to match', async () => {
					fm
						.mock('http://it.at.there/', 200, { method: 'POST'})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {method: 'GET'});
					expect(fm.calls().matched.length).to.equal(0);
					await fm.fetchHandler('http://it.at.there/', {method: 'POST'});
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('match implicit GET', async () => {
					fm
						.mock('http://it.at.there/', 200, { method: 'GET'})
						.catch();

					await fm.fetchHandler('http://it.at.there/');
					expect(fm.calls().matched.length).to.equal(1);
				});

				it('be case insensitive', async () => {
					fm
						.mock('http://it.at.there/', 200, { method: 'POST'})
						.mock('http://it.at.there/', 200, { method: 'patch'})
						.catch();

					await fm.fetchHandler('http://it.at.there/', {method: 'post'});
					expect(fm.calls().matched.length).to.equal(1);
					await fm.fetchHandler('http://it.at.there/', {method: 'PATCH'});
					expect(fm.calls().matched.length).to.equal(2);
				});

				it('can be used alongside function matchers', async () => {
					fm
						.mock(url => /person/.test(url), 200, { method: 'POST'})
						.catch();

					await fm.fetchHandler('http://domain.com/person');
					expect(fm.calls().matched.length).to.equal(0);
					await fm.fetchHandler('http://domain.com/person', {method: 'POST'});
					expect(fm.calls().matched.length).to.equal(1);
				});

				['get', 'post', 'put', 'delete', 'head', 'patch'].forEach(method => {
					it(`have shorthand method for ${method}`, async () => {
						fm[method]('http://it.at.there/', 200)
							.catch();

						await fm.fetchHandler('http://it.at.there/', {method: 'bad-method'});
						expect(fm.calls().matched.length).to.equal(0);
						await fm.fetchHandler('http://it.at.there/', {method});
						expect(fm.calls().matched.length).to.equal(1);
					});
				})
			});
		});

		describe('multiple routes', () => {
			it('match several routes with one instance', async () => {
				fm
					.mock('http://it.at.here/', 200)
					.mock('http://it.at.there/', 200);

				await fm.fetchHandler('http://it.at.here/');
				expect(fm.calls().matched.length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls().matched.length).to.equal(2);
			});

			it('match first route that matches', async () => {
				fm
					.mock('http://it.at.there/', 200)
					.mock('begin:http://it.at.there/', 300);

				const res = await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls().matched.length).to.equal(1);
				expect(res.status).to.equal(200)
			});

			describe.skip('duplicate routes', () => {
				it('error when duplicate route added', async () => {

				});

				it('allow overwriting existing route', async () => {

				});

				it('allow adding additional route with same matcher', async () => {

				});
			})
		});

		describe('unmatched calls', () => {

			it('throws if any calls unmatched', async () => {
				fm.mock(/a/, 200);
				expect(async () => {
					await fm.fetchHandler('http://1')
				}).to.throw;
			});

			it('catch unmatched calls with empty 200 by default', async () => {
				fm
					.catch();

				const res = await fm.fetchHandler('http://1');
				expect(fm.calls().unmatched.length).to.equal(1);
				expect(res.status).to.equal(200);
			});

			it('can catch unmatched calls with custom response', async () => {
				fm
					.catch({iam: 'json'});

				const res = await fm.fetchHandler('http://1');
				expect(fm.calls().unmatched.length).to.equal(1);
				expect(res.status).to.equal(200);
				expect(await res.json()).to.eql({iam: 'json'});
			});

			it('can catch unmatched calls with function', async () => {
				fm
					.catch(() => new fm.config.Response('i am text', {status: 200	}));
				const res = await fm.fetchHandler('http://1')
				expect(fm.calls().unmatched.length).to.equal(1);
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('i am text');
			});

		});

		describe('edge cases', () => {
			it('match relative urls', async () => {
				fm
					.mock('/it.at.there/', 200)
					.catch();

				await fm.fetchHandler('/it.at.there/')
				expect(fm.calls().matched.length).to.equal(1);
			});

			it('match when called with Request', async () => {
				fm
					.post('http://it.at.there/', 200)
					.catch();

				await fm.fetchHandler(new fm.config.Request('http://it.at.there/', {method: 'POST'}));
				expect(fm.calls().matched.length).to.equal(1);
			});
		});
	});
}
