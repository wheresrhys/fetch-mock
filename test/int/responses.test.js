const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
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

			it('response that throws', async () => {
				fm.mock('http://it.at.there/', {
					throws: 'Oh no'
				});

				try {
					const res = fm.fetchHandler('http://it.at.there/')
					expect(true).to.be.false
				} catch (err) {
					expect(err).to.equal('Oh no');
				}
			});

			it('Response', async () => {
				fm.mock('http://it.at.there/', new fm.config.Response('http://it.at.there/', {status: 200}));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			it('function that returns a Response', async () => {
				fm.mock('http://it.at.there/', () => new fm.config.Response('http://it.at.there/', {status: 200}));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

			it('Promise that returns a Response', async () => {
				fm.mock('http://it.at.there/', Promise.resolve(new fm.config.Response('http://it.at.there/', {status: 200})));
				const res = await fm.fetchHandler('http://it.at.there/');
				expect(res.status).to.equal(200);
			});

		});

	});
}
