const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

module.exports = (fetchMock) => {
	describe('repeat and done()', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
		});

		afterEach(() => fm.restore());

		describe.skip('fallThroughToNetwork', () => {
			it('error by default', async () => {

			});

			it('not error when configured globally', async () => {

			});

			it('error when configured on sandbox without fetch defined', async () => {

			});

			it('not error when configured on sandbox without fetch defined', async () => {

			});

		});

		describe.skip('includeContentLength', () => {
			it('include content-length header by default', async () => {

			});

			it('don\'t include when configured false', async () => {

			});
			it('local setting can override to true', async () => {

			});

			it('local setting can override to false', async () => {

			});




		// 	it.skip('has includeContentLength off by default', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				done();
		// 			});
		// 	});

		// 	it.skip('can configure includeContentLength on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it.skip('includeContentLength can override the global setting to on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it.skip('includeContentLength can override the global setting to off', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: false});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});
		});

		describe.skip('sendAsJson', () => {
			it('convert object responses to json by default', async () => {

			});

			it('don\'t convert when configured false', async () => {

			});

			it('local setting can override to true', async () => {

			});

			it('local setting can override to false', async () => {

			});


		// 	it.skip('can configure sendAsJson off', () => {
		// 		sinon.spy(JSON, 'stringify');
		// 		fetchMock.config.sendAsJson = false;
		// 		fetchMock.mock('http://it.at.there/', {not: 'an object'});
		// 		try {
		// 			// it should throw as we're trying to respond with unstringified junk
		// 			// ideally we'd use a buffer in the test, but the browser and node APIs differ
		// 			fetch('http://it.at.there/')
		// 			expect(false).to.be.true;
		// 		} catch (e) {
		// 			expect(JSON.stringify.calledWith({not: 'an object'})).to.be.false;
		// 			JSON.stringify.restore();
		// 			fetchMock.config.sendAsJson = true;
		// 		}
		// 	});

		});

		describe.skip('warnOnFallback', () => {
			it('warn on fallback response by default', async () => {

			});

			it('don\'t warn on fallback response when configured false', async () => {

			});
		});

		describe.skip('overwriteRoutes', () => {
			it('error on duplicate routes by default', async () => {

			});

			it('allow overwriting existing route', async () => {

			});

			it('allow adding additional route with same matcher', async () => {

			});
		});
	});
};
