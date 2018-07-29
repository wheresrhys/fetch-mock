const chai = require('chai');
const expect = chai.expect;

module.exports = fetchMock => {
	describe('routing', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		describe('url matching', () => {
			it('match exact strings', async () => {
				fm.mock('http://it.at.there/path', 200).catch();

				await fm.fetchHandler('http://it.at.there/path');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/path/abouts');
				await fm.fetchHandler('http://it.at.the');
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match begin: keyword', async () => {
				fm.mock('begin:http://it.at.there/path', 200).catch();

				await fm.fetchHandler('http://it.at.there/path');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/path/abouts');
				expect(fm.calls(true).length).to.equal(2);
				await fm.fetchHandler('http://it.at.here/path/abouts');
				expect(fm.calls(true).length).to.equal(2);
			});

			it('match end: keyword', async () => {
				fm.mock('end:there/path', 200).catch();

				await fm.fetchHandler('http://it.at.there/path');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/path/abouts');
				await fm.fetchHandler('http://it.at.here/path');
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match glob: keyword', async () => {
				fm.mock('glob:/its/*/*', 200).catch();

				await fm.fetchHandler('/its/a/boy');
				await fm.fetchHandler('/its/a/girl');
				expect(fm.calls(true).length).to.equal(2);
				await fm.fetchHandler('/its/alive');
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

			it('match wildcard string', async () => {
				fm.mock('*', 200);

				await fm.fetchHandler('http://it.at.there');
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match regular expressions', async () => {
				const rx = /http\:\/\/it\.at\.there\/\d+/;
				fm.mock(rx, 200).catch();

				await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls(true).length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/12345');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/abcde');
				expect(fm.calls(true).length).to.equal(1);
			});

			describe('host normalisation', () => {
				it('match exact pathless urls regardless of trailing slash', async () => {
					fm.mock('http://it.at.there/', 200)
						.mock('http://it.at.here', 200).catch();

					await fm.fetchHandler('http://it.at.there/');
					await fm.fetchHandler('http://it.at.there');
					expect(fm.calls('http://it.at.there').length).to.equal(2);
					expect(fm.calls('http://it.at.there/').length).to.equal(2);
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.here');
					expect(fm.calls('http://it.at.here').length).to.equal(2);
					expect(fm.calls('http://it.at.here/').length).to.equal(2);
				});

				it('match end: keyword on pathless urls regardless of trailing slash', async () => {
					fm.mock('end:.there/', 200)
						.mock('end:.here', 200).catch();

					await fm.fetchHandler('http://it.at.there/');
					await fm.fetchHandler('http://it.at.there');
					expect(fm.calls('http://it.at.there').length).to.equal(2);
					expect(fm.calls('http://it.at.there/').length).to.equal(2);
					await fm.fetchHandler('http://it.at.here/');
					await fm.fetchHandler('http://it.at.here');
					expect(fm.calls('http://it.at.here').length).to.equal(2);
					expect(fm.calls('http://it.at.here/').length).to.equal(2);
				});
			})
		});

		describe('non url matching', () => {
			it('match using custom function', async () => {
				fm.mock((url, opts) => {
					return (
						url.indexOf('logged-in') > -1 &&
						opts &&
						opts.headers &&
						opts.headers.authorized === true
					);
				}, 200).catch();

				await fm.fetchHandler('http://it.at.there/12345', {
					headers: { authorized: true }
				});
				expect(fm.calls(true).length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/logged-in');
				expect(fm.calls(true).length).to.equal(0);
				await fm.fetchHandler('http://it.at.there/logged-in', {
					headers: { authorized: true }
				});
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match using custom function with Request', async () => {
				fm.mock(req => {
					return (
						req.url.indexOf('logged-in') > -1 && req.headers.get('authorized')
					);
				}, 200).catch();

				await fm.fetchHandler(
					new fm.config.Request('http://it.at.there/logged-in', {
						headers: { authorized: 'true' }
					})
				);
				expect(fm.calls(true).length).to.equal(1);
			});

			describe('headers', () => {
				it('not match when headers not present', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/');
					expect(fm.calls(true).length).to.equal(0);
				});

				it("not match when headers don't match", async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: 'c' }
					});
					expect(fm.calls(true).length).to.equal(0);
				});

				it('match simple headers', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: 'b' }
					});
					expect(fm.calls(true).length).to.equal(1);
				});

				it('be case insensitive', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { A: 'b' }
					});
					expect(fm.calls(true).length).to.equal(1);
				});

				it('match multivalue headers', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: ['b', 'c'] }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: ['b', 'c'] }
					});
					expect(fm.calls(true).length).to.equal(1);
				});

				it('not match partially satisfied multivalue headers', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: ['b', 'c', 'd'] }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: ['b', 'c'] }
					});
					expect(fm.calls(true).length).to.equal(0);
				});

				it('match multiple headers', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b', c: 'd' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: 'b', c: 'd' }
					});
					expect(fm.calls(true).length).to.equal(1);
				});

				it('not match unsatisfied multiple headers', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b', c: 'd' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: { a: 'b' }
					});
					expect(fm.calls(true).length).to.equal(0);
				});

				it('match Headers instance', async () => {
					fm.mock('http://it.at.there/', 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there/', {
						headers: new fm.config.Headers({ a: 'b' })
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
						.mock('http://it.at.there/', 200, {
							headers: { a: 'b' }
						})
						.catch();

					await customHeaderInstance.fetchHandler('http://it.at.there/', {
						headers: new customHeaderInstance.config.Headers({ a: 'b' })
					});
					expect(customHeaderInstance.calls(true).length).to.equal(1);
				});

				it('can be used alongside function matchers', async () => {
					fm.mock(url => /person/.test(url), 200, {
						headers: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://domain.com/person');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://domain.com/person', {
						headers: { a: 'b' }
					});
					expect(fm.calls(true).length).to.equal(1);
				});
			});

			describe('query strings', () => {
				it('can match a query string', async () => {
					fm.mock('http://it.at.there/', 200, { query: { a: 'b' } }).catch();

					await fm.fetchHandler('http://it.at.there');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://it.at.there?a=b');
					expect(fm.calls(true).length).to.equal(1);
				});

				it('can match multiple query strings', async () => {
					fm.mock('http://it.at.there/', 200, {
						query: { a: 'b', c: 'd' }
					}).catch();

					await fm.fetchHandler('http://it.at.there');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://it.at.there?a=b');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://it.at.there?a=b&c=d');
					expect(fm.calls(true).length).to.equal(1);
					await fm.fetchHandler('http://it.at.there?c=d&a=b');
					expect(fm.calls(true).length).to.equal(2);
				});

				it('can be used alongside existing query strings', async () => {
					fm.mock('http://it.at.there/?c=d', 200, {
						query: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://it.at.there?c=d');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://it.at.there?c=d&a=b');
					expect(fm.calls(true).length).to.equal(1);
					await fm.fetchHandler('http://it.at.there?a=b&c=d');
					expect(fm.calls(true).length).to.equal(1);
				});

				it('can be used alongside function matchers', async () => {
					fm.mock(url => /person/.test(url), 200, {
						query: { a: 'b' }
					}).catch();

					await fm.fetchHandler('http://domain.com/person');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://domain.com/person?a=b');
					expect(fm.calls(true).length).to.equal(1);
				});
			});

			describe('methods', () => {
				it('match any method by default', async () => {
					fm.mock('http://it.at.there/', 200).catch();

					await fm.fetchHandler('http://it.at.there/', { method: 'GET' });
					expect(fm.calls(true).length).to.equal(1);
					await fm.fetchHandler('http://it.at.there/', { method: 'POST' });
					expect(fm.calls(true).length).to.equal(2);
				});

				it('configure an exact method to match', async () => {
					fm.mock('http://it.at.there/', 200, { method: 'POST' }).catch();

					await fm.fetchHandler('http://it.at.there/', { method: 'GET' });
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://it.at.there/', { method: 'POST' });
					expect(fm.calls(true).length).to.equal(1);
				});

				it('match implicit GET', async () => {
					fm.mock('http://it.at.there/', 200, { method: 'GET' }).catch();

					await fm.fetchHandler('http://it.at.there/');
					expect(fm.calls(true).length).to.equal(1);
				});

				it('be case insensitive', async () => {
					fm.mock('http://it.at.there/', 200, { method: 'POST' })
						.mock('http://it.at.where/', 200, { method: 'patch' })
						.catch();

					await fm.fetchHandler('http://it.at.there/', { method: 'post' });
					expect(fm.calls(true).length).to.equal(1);
					await fm.fetchHandler('http://it.at.where/', { method: 'PATCH' });
					expect(fm.calls(true).length).to.equal(2);
				});

				it('can be used alongside function matchers', async () => {
					fm.mock(url => /person/.test(url), 200, { method: 'POST' }).catch();

					await fm.fetchHandler('http://domain.com/person');
					expect(fm.calls(true).length).to.equal(0);
					await fm.fetchHandler('http://domain.com/person', { method: 'POST' });
					expect(fm.calls(true).length).to.equal(1);
				});

				['get', 'post', 'put', 'delete', 'head', 'patch'].forEach(method => {
					it(`have shorthand method for ${method}`, async () => {
						fm[method]('http://it.at.there/', 200).catch();

						await fm.fetchHandler('http://it.at.there/', {
							method: 'bad-method'
						});
						expect(fm.calls(true).length).to.equal(0);
						await fm.fetchHandler('http://it.at.there/', { method });
						expect(fm.calls(true).length).to.equal(1);
					});
				});
			});
		});

		describe('multiple routes', () => {
			it('match several routes with one instance', async () => {
				fm.mock('http://it.at.here/', 200).mock('http://it.at.there/', 200);

				await fm.fetchHandler('http://it.at.here/');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls(true).length).to.equal(2);
			});

			it('match first route that matches', async () => {
				fm.mock('http://it.at.there/', 200).mock(
					'begin:http://it.at.there/',
					300
				);

				const res = await fm.fetchHandler('http://it.at.there/');
				expect(fm.calls(true).length).to.equal(1);
				expect(res.status).to.equal(200);
			});

			describe('duplicate routes', () => {
				it('error when duplicate route added using explicit route name', async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200, { name: 'jam' })
							.mock('begin:http://it.at.there/', 300, { name: 'jam' })
					).to.throw();
				});

				it('error when duplicate route added using implicit route name', async () => {
					expect(() =>
						fm.mock('http://it.at.there/', 200).mock('http://it.at.there/', 300)
					).to.throw();
				});

				it("don't error when duplicate route added with non-clashing method", async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200, { method: 'GET' })
							.mock('http://it.at.there/', 300, { method: 'POST' })
					).not.to.throw();
				});

				it('error when duplicate route added with no method', async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200, { method: 'GET' })
							.mock('http://it.at.there/', 300)
					).to.throw();
				});

				it('error when duplicate route added with clashing method', async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200, { method: 'GET' })
							.mock('http://it.at.there/', 300, { method: 'GET' })
					).to.throw();
				});

				it('allow overwriting existing route', async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200)
							.mock('http://it.at.there/', 300, { overwriteRoutes: true })
					).not.to.throw();

					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.status).to.equal(300);
				});

				it('allow adding additional route with same matcher', async () => {
					expect(() =>
						fm
							.mock('http://it.at.there/', 200, { repeat: 1 })
							.mock('http://it.at.there/', 300, { overwriteRoutes: false })
					).not.to.throw();

					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.status).to.equal(200);
					const res2 = await fm.fetchHandler('http://it.at.there/');
					expect(res2.status).to.equal(300);
				});
			});
		});

		describe('unmatched calls', () => {
			it('throws if any calls unmatched', async () => {
				fm.mock(/a/, 200);
				expect(() => fm.fetchHandler('http://1')).to.throw();
			});

			it('catch unmatched calls with empty 200 by default', async () => {
				fm.catch();

				const res = await fm.fetchHandler('http://1');
				expect(fm.calls(false).length).to.equal(1);
				expect(res.status).to.equal(200);
			});

			it('can catch unmatched calls with custom response', async () => {
				fm.catch({ iam: 'json' });

				const res = await fm.fetchHandler('http://1');
				expect(fm.calls(false).length).to.equal(1);
				expect(res.status).to.equal(200);
				expect(await res.json()).to.eql({ iam: 'json' });
			});

			it('can catch unmatched calls with function', async () => {
				fm.catch(() => new fm.config.Response('i am text', { status: 200 }));
				const res = await fm.fetchHandler('http://1');
				expect(fm.calls(false).length).to.equal(1);
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('i am text');
			});
		});

		describe('edge cases', () => {
			it('match relative urls', async () => {
				fm.mock('/it.at.there/', 200).catch();

				await fm.fetchHandler('/it.at.there/');
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match relative urls with dots', async () => {
				fm.mock('/it.at/there/', 200).catch();

				await fm.fetchHandler('/it.at/not/../there/');
				expect(fm.calls(true).length).to.equal(1);
				await fm.fetchHandler('./it.at/there/');
				expect(fm.calls(true).length).to.equal(2);
			});

			it('match absolute urls with dots', async () => {
				fm.mock('http://it.at/there/', 200).catch();

				await fm.fetchHandler('http://it.at/not/../there/');
				expect(fm.calls(true).length).to.equal(1);
			});

			it('match when called with Request', async () => {
				fm.post('http://it.at.there/', 200).catch();

				await fm.fetchHandler(
					new fm.config.Request('http://it.at.there/', { method: 'POST' })
				);
				expect(fm.calls(true).length).to.equal(1);
			});
		});
	});
};
