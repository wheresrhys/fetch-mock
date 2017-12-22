// first test everything that has something happening before getting in to response-builder
// - maybe mock out response builder
// then test everything that gets into response builder


// describe('responding', () => {

// 				it('respond with a Response', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: new Response('i am text', {status: 200})
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text()
// 								.then(text => {
// 									expect(text).to.equal('i am text');
// 								})
// 						});
// 				});

// 				it('respond with a generated Response', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: () => new Response('i am text too', {status: 200})
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text()
// 								.then(text => {
// 									expect(text).to.equal('i am text too');
// 								})
// 						});
// 				});

// 				it('respond with a status', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: 300
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(300);
// 							expect(res.statusText).to.equal('Multiple Choices');
// 						});
// 				});

// 				it('respond with a string', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: 'a string'
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							expect(res.statusText).to.equal('OK');
// 							return res.text()
// 						})
// 						.then(text => {
// 							expect(text).to.equal('a string');
// 						});
// 				});

// 				it('respond with a json', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: {an: 'object'}
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							expect(res.statusText).to.equal('OK');
// 							return res.json();
// 						})
// 						.then(json => {
// 							expect(json).to.eql({an: 'object'});
// 						});
// 				});

// 				it('respond with a status', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: {status: 404}
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(404);
// 							expect(res.statusText).to.equal('Not Found');
// 						});
// 				});

// 				it('respond with a complex response, including headers', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: {
// 							status: 202,
// 							body: {an: 'object'},
// 							headers: {
// 								header: 'val'
// 							}
// 						}
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.status).to.equal(202);
// 							expect(res.headers.get('header')).to.equal('val');
// 							res.json().then(json => {
// 								expect(json).to.eql({an: 'object'});
// 							});
// 						});
// 				});

// 				it('imitate a failed request', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: {
// 							throws: 'Oh no'
// 						}
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(() => {
// 							return Promise.reject('Expected fetch to fail');
// 						}, err => {
// 							expect(err).to.equal('Oh no');
// 						});
// 				});

// 				it('respond with a redirected response', () => {
// 					fetchMock.mock('http://it.at.there/', {
// 						redirectUrl: 'http://it.at.there/destination',
// 						body: 'I am a redirect'
// 					});
// 					return fetch('http://it.at.there/')
// 						.then(res => {
// 							expect(res.redirected).to.equal(true);
// 							expect(res.url).to.equal('http://it.at.there/destination');
// 							return res.text()
// 								.then(text => {
// 									expect(text).to.equal('I am a redirect')
// 								})
// 						});
// 				});

// 				it('construct a response based on the request', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: (url, opts) => {
// 							return url + opts.headers.header;
// 						}
// 					});
// 					return fetch('http://it.at.there/', {headers: {header: 'val'}})
// 						.then(res => {
// 							expect(res.status).to.equal(200);
// 							return res.text().then(text => {
// 								expect(text).to.equal('http://it.at.there/val');
// 							});
// 						});
// 				});

// 				it('construct a promised response based on the request', () => {
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: (url, opts) => {
// 							return Promise.resolve(url + opts.headers.header);
// 						}
// 					});
// 					return fetch('http://it.at.there/', {headers: {header: 'val'}})
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
// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: promise.then(() => 200)
// 					});
// 					const stub = sinon.spy(res => res);

// 					fetch('http://it.at.there/', {headers: {header: 'val'}})
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

// 					fetchMock.mock({
// 						name: 'route',
// 						matcher: 'http://it.at.there/',
// 						response: promise.then(() => (url, opts) => {
// 							return url + opts.headers.header;
// 						})
// 					});
// 					const stub = sinon.spy(res => res);

// 					fetch('http://it.at.there/', {headers: {header: 'val'}})
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

			it('should expect valid statuses', () => {
				fetchMock.mock('http://foo.com', { status: 'not number' })
				fetch('http://foo.com')
					.then(() => {
						expect(true).to.be.false;
					}, err => {
						expect(err).to.equal(`Invalid status not number passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`)
					})
			})

							it('should set the url property on responses', () => {
					fetchMock.mock('begin:http://foo.com', 200)
					return fetch('http://foo.com/path?query=string')
						.then(res => expect(res.url).to.equal('http://foo.com/path?query=string'))
				})


							it('should allow non native Promises as responses', () => {
				const stub = sinon.spy(() => Promise.resolve(new Response('', {status: 203})));
				fetchMock.mock(/.*/, {
					then: stub
				})
				return fetch('http://thing.place')
					.then(res => {
						expect(stub.calledOnce).to.be.true
						expect(res.status).to.equal(203);
						fetchMock.restore();
					})
			})