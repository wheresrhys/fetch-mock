const chai = require('chai');
const expect = chai.expect;

module.exports = fetchMock => {
	describe('responses', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore());

		describe('response building', () => {
			it('respond with a status', async () => {
				fm.mock('http://it.at.there/', 300);
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(300);
				expect(res.statusText).to.equal('Multiple Choices');
			});

			it('should error on invalid statuses', async () => {
				fm.mock('http://foo.com/', { status: 'not number' });
				try {
					await fm.fetchHandler('http://foo.com');
					expect(true).to.be.false;
				} catch (err) {
					expect(err.message).to
						.equal(`Invalid status not number passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
				}
			});

			it('respond with a string', async () => {
				fm.mock('http://it.at.there/', 'a string');
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
				expect(res.statusText).to.equal('OK');
				expect(await res.text()).to.equal('a string');
			});

			describe('json responses', () => {
				it('respond with a json', async () => {
					fm.mock('http://it.at.there/', { an: 'object' });
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.status).to.equal(200);
					expect(res.statusText).to.equal('OK');
					expect(res.headers.get('content-type')).to.equal('application/json');
					expect(await res.json()).to.eql({ an: 'object' });
				});

				it('convert body properties to json', async () => {
					fm.mock('http://it.at.there/', {
						body: { an: 'object' }
					});
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).to.equal('application/json');
					expect(await res.json()).to.eql({ an: 'object' });
				});

				it('not overide existing content-type-header', async () => {
					fm.mock('http://it.at.there/', {
						body: { an: 'object' },
						headers: {
							'content-type': 'text/html'
						}
					});
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).to.equal('text/html');
					expect(await res.json()).to.eql({ an: 'object' });
				});

				it('not convert if `body` property exists', async () => {
					fm.mock('http://it.at.there/', { body: 'exists' });
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).not.to.equal(
						'application/json'
					);
				});

				it('not convert if `headers` property exists', async () => {
					fm.mock('http://it.at.there/', { headers: {} });
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).not.to.exist;
				});

				it('not convert if `status` property exists', async () => {
					fm.mock('http://it.at.there/', { status: 300 });
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).not.to.exist;
				});

				// in the browser the fetch spec disallows invoking res.headers on an
				// object that inherits from a response, thus breaking the ability to
				// read headers of a fake redirected response.
				if (typeof window === 'undefined') {
					it('not convert if `redirectUrl` property exists', async () => {
						fm.mock('http://it.at.there/', {
							redirectUrl: 'http://url.to.hit'
						});
						const res = await fm.fetchHandler('http://it.at.there/');
						expect(res.headers.get('content-type')).not.to.exist;
					});
				}

				it('convert if non-whitelisted property exists', async () => {
					fm.mock('http://it.at.there/', { status: 300, weird: true });
					const res = await fm.fetchHandler('http://it.at.there/');
					expect(res.headers.get('content-type')).to.equal('application/json');
				});
			});

			it('respond with a complex response, including headers', async () => {
				fm.mock('http://it.at.there/', {
					status: 202,
					body: { an: 'object' },
					headers: {
						header: 'val'
					}
				});
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(202);
				expect(res.headers.get('header')).to.equal('val');
				expect(await res.json()).to.eql({ an: 'object' });
			});

			// The fetch spec does not allow for manual url setting
			// However node-fetch does, so we only run this test on the server
			if (typeof window === 'undefined') {
				it('should set the url property on responses', async () => {
					fm.mock('begin:http://foo.com', 200);
					const res = await fm.fetchHandler('http://foo.com/path?query=string');
					expect(res.url).to.equal('http://foo.com/path?query=string');
				});

				it('should set the url property on responses when called with Request', async () => {
					fm.mock('begin:http://foo.com', 200);
					const res = await fm.fetchHandler(
						new fm.config.Request('http://foo.com/path?query=string')
					);
					expect(res.url).to.equal('http://foo.com/path?query=string');
				});
			}

			it('respond with a redirected response', async () => {
				fm.mock('http://it.at.there/', {
					redirectUrl: 'http://it.at.there/destination',
					body: 'I am a redirect'
				});
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.redirected).to.equal(true);
				expect(res.url).to.equal('http://it.at.there/destination');
				expect(await res.text()).to.equal('I am a redirect');
			});

			it('construct a response based on the request', async () => {
				fm.mock(
					'http://it.at.there/',
					(url, opts) => url + opts.headers.header
				);
				const res = await fm.fetchHandler('http://it.at.there/', {
					headers: { header: 'val' }
				});
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('http://it.at.there/val');
			});

			describe('content-length', () => {
				it('should work on body of type string', async () => {
					fm.mock('http://it.at.there/', 'Fetch-Mock rocks');
					const res = await fetch('http://it.at.there/');
					expect(res.headers.get('content-length')).to.equal('16');
				});

				it('should work on body of type object', async () => {
					fm.mock('http://it.at.there/', { hello: 'world' });
					const res = await fetch('http://it.at.there/');
					expect(res.headers.get('content-length')).to.equal('17');
				});

				it('should not overrule explicit mocked content-length header', async () => {
					fm.mock('http://it.at.there/', {
						body: {
							hello: 'world'
						},
						headers: {
							'Content-Length': '100'
						}
					});
					const res = await fetch('http://it.at.there/');
					expect(res.headers.get('content-length')).to.equal('100');
				});

				it('should be case-insensitive when checking for explicit content-length header', async () => {
					fm.mock('http://it.at.there/', {
						body: {
							hello: 'world'
						},
						headers: {
							'CoNtEnT-LeNgTh': '100'
						}
					});
					const res = await fetch('http://it.at.there/');
					expect(res.headers.get('content-length')).to.equal('100');
				});
			});
		});

		describe('response negotiation', () => {

			it('function', async () => {
				fm.mock('http://it.at.there/', url => url);
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('http://it.at.there/');
			});

			it('Promise', async () => {
				fm.mock('http://it.at.there/', Promise.resolve(200));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			it('function that returns a Promise', async () => {
				fm.mock('http://it.at.there/', url => Promise.resolve(url));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('http://it.at.there/');
			});

			it('Promise for a function that returns a response', async () => {
				fm.mock('http://it.at.there/', Promise.resolve(url => url));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
				expect(await res.text()).to.equal('http://it.at.there/');
			});

			it('Response', async () => {
				fm.mock(
					'http://it.at.there/',
					new fm.config.Response('http://it.at.there/', { status: 200 })
				);
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			it('function that returns a Response', async () => {
				fm.mock(
					'http://it.at.there/',
					() => new fm.config.Response('http://it.at.there/', { status: 200 })
				);
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			it('Promise that returns a Response', async () => {
				fm.mock(
					'http://it.at.there/',
					Promise.resolve(
						new fm.config.Response('http://it.at.there/', { status: 200 })
					)
				);
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			describe('rejecting', () => {
				it('reject if object with `throws` property', async () => {
					fm.mock('http://it.at.there/', {throws: 'as expected'});

					return fm.fetchHandler('http://it.at.there/')
						.then(() => {
							throw 'not as expected';
						})
						.catch(err => {
							expect(err).to.equal('as expected');
						})
				});

				it('reject if function that returns object with `throws` property', async () => {
					fm.mock('http://it.at.there/', () => ({throws: 'as expected'}));

					return fm.fetchHandler('http://it.at.there/')
						.then(() => {
							throw 'not as expected';
						})
						.catch(err => {
							expect(err).to.equal('as expected');
						})
				});

			})
		});
	});
};
