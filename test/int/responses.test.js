const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
	describe.only('responses', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		describe('response building', () => {

			it('respond with a status', async () => {
				fm.mock('http://it.at.there/', 300);
				const res = await fm.fetchHandler('http://it.at.there/')
				expect(res.status).to.equal(300);
				expect(res.statusText).to.equal('Multiple Choices');
			});

			it('should error on invalid statuses', async () => {
				fm.mock('http://foo.com', { status: 'not number' })
				try {
					await fm.fetchHandler('http://foo.com')
					expect(true).to.be.false;
				} catch (err) {
					expect(err.message).to.equal(`Invalid status not number passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`)
				}
			})

			it('respond with a string', async () => {
				fm.mock('http://it.at.there/', 'a string');
				const res = await fm.fetchHandler('http://it.at.there/')
				expect(res.status).to.equal(200);
				expect(res.statusText).to.equal('OK');
				expect(await res.text()).to.equal('a string');
			});

			it('respond with a json', async () => {
				fm.mock('http://it.at.there/', {an: 'object'});
				const res = await fm.fetchHandler('http://it.at.there/')
				expect(res.status).to.equal(200);
				expect(res.statusText).to.equal('OK');
				expect(await res.json()).to.eql({an: 'object'});
			});

			it('respond with a complex response, including headers', async () => {
				fm.mock('http://it.at.there/', {
					status: 202,
					body: {an: 'object'},
					headers: {
						header: 'val'
					}
				});
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(202);
				expect(res.headers.get('header')).to.equal('val');
				expect(await res.json()).to.eql({an: 'object'});
			});

			it('should set the url property on responses', async () => {
				fm.mock('begin:http://foo.com', 200)
				const res = await fm.fetchHandler('http://foo.com/path?query=string')
				expect(res.url).to.equal('http://foo.com/path?query=string');
			})

			it('respond with a redirected response', async () => {
				fm.mock('http://it.at.there/', {
					redirectUrl: 'http://it.at.there/destination',
					body: 'I am a redirect'
				});
				const res = await fm.fetchHandler('http://it.at.there/')
				expect(res.redirected).to.equal(true);
				expect(res.url).to.equal('http://it.at.there/destination');
				expect(await res.text()).to.equal('I am a redirect')
			});

			it('construct a response based on the request', async () => {
				fm.mock('http://it.at.there/', (url, opts) => url + opts.headers.header);
				const res = await fm.fetchHandler('http://it.at.there/', {headers: {header: 'val'}})
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('http://it.at.there/val');
			});

		});

		describe('response negotiation', () => {
			it('function that returns a response config', async () => {

			});

			it('Promise that returns a response config', async () => {

			});

			it('function that returns a Promise fro a response', async () => {

			});

			it('Promise for a function that returns a response', async () => {

			});

			it('response that throws', async () => {

			});

			it('Response', async () => {

			});

			it('function that returns a Response', async () => {

			});

			it('Promise that returns a Response', async () => {

			});

		});



	});
}


			// 				it('should allow non native Promises as responses', () => {
			// 	const stub = sinon.spy(() => Promise.resolve(new Response('', {status: 203})));
			// 	fm.mock(/.*/, {
			// 		then: stub
			// 	})
			// 	return fm.fetchHandler('http://thing.place')
			// 		.then(res => {
			// 			expect(stub.calledOnce).to.be.true
			// 			expect(res.status).to.equal(203);
			// 			fm.restore();
			// 		})
			// })
// describe('responding', () => {

// 				it('respond with a Response', () => {
// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: new Response('i am text', {status: 200})
// 					});
// 					return fm.fetchHandler('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text()
// 								.then(text => {
// 									expect(text).to.equal('i am text');
// 								})
// 						});
// 				});

// 				it('respond with a generated Response', () => {
// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: () => new Response('i am text too', {status: 200})
// 					});
// 					return fm.fetchHandler('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text()
// 								.then(text => {
// 									expect(text).to.equal('i am text too');
// 								})
// 						});
// 				});

// 				it('imitate a failed request', () => {
// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: {
// 							throws: 'Oh no'
// 						}
// 					});
// 					return fm.fetchHandler('http://it.at.there/')
// 						.then(() => {
// 							return Promise.reject('Expected fetch to fail');
// 						}, err => {
// 							expect(err).to.equal('Oh no');
// 						});
// 				});


// 				it('construct a promised response based on the request', () => {
// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: (url, opts) => {
// 							return Promise.resolve(url + opts.headers.header);
// 						}
// 					});
// 					return fm.fetchHandler('http://it.at.there/', {headers: {header: 'val'}})
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text().then(text => {
// 								expect(text).to.equal('http://it.at.there/val');
// 							});
// 						});
// 				});

// 				it('respond with a promise of a response', done => {
// 					let resolve;
// 					const promise = new Promise(res => { resolve = res})
// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: promise.then(() => 200)
// 					});
// 					const stub = sinon.spy(res => res);

// 					fm.fetchHandler('http://it.at.there/', {headers: {header: 'val'}})
// 						.then(stub)
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 						});

// 					setTimeout(() => {
// 						expect(stub.called).to.be.false;
// 						resolve();
// 						setTimeout(() => {
// 							expect(stub.called).to.be.true;
// 							done();
// 						}, 10)
// 					}, 10)
// 				});

// 				it ('respond with a promise of a complex response', done => {
// 					let resolve;

// 					const promise = new Promise(res => {resolve = res})

// 					fm.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: promise.then(() => (url, opts) => {
// 							return url + opts.headers.header;
// 						})
// 					});
// 					const stub = sinon.spy(res => res);

// 					fm.fetchHandler('http://it.at.there/', {headers: {header: 'val'}})
// 						.then(stub)
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text().then(text => {
// 								expect(text).to.equal('http://it.at.there/val');
// 							});
// 						});
// 					setTimeout(() => {
// 						expect(stub.called).to.be.false;
// 						resolve();
// 						setTimeout(() => {
// 							expect(stub.called).to.be.true;
// 							done();
// 						}, 10)
// 					}, 10)
// 				});
