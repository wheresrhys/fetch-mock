const BluebirdPromise = require('bluebird');
const GlobalPromise = Promise;

		// describe('configurability', () => {
		// 	it('can configure sendAsJson off', () => {
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

		// 	it.skip('has includeContentLength off by default', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				done();
		// 			});
		// 	});

		// 	it('can configure includeContentLength on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it('includeContentLength can override the global setting to on', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});

		// 	it('includeContentLength can override the global setting to off', done => {
		// 		fetchMock.config.includeContentLength = true;
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: false});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.has('content-length')).to.be.false;
		// 				fetchMock.config.includeContentLength = false;
		// 				done();
		// 			});
		// 	});
		// describe('includeContentLength', () => {
		// 	it('should work on body of type object', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: {hello: 'world'}, includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('17');
		// 				done();
		// 			});
		// 	});

		// 	it('should work on body of type string', done => {
		// 		fetchMock.mock('http://it.at.there/', {body: 'Fetch-Mock rocks', includeContentLength: true});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('16');
		// 				done();
		// 			});
		// 	});

		// 	it('should not overrule explicit mocked content-length header', done => {
		// 		fetchMock.mock('http://it.at.there/', {
		// 			body: {
		// 				hello: 'world'
		// 			},
		// 			headers: {
		// 				'Content-Length': '100',
		// 			},
		// 			includeContentLength: true
		// 		});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('100');
		// 				done();
		// 			});
		// 	});

		// 	it('should be case-insensitive when checking for explicit content-length header', done => {
		// 		fetchMock.mock('http://it.at.there/', {
		// 			body: {
		// 				hello: 'world'
		// 			},
		// 			headers: {
		// 				'CoNtEnT-LeNgTh': '100',
		// 			},
		// 			includeContentLength: true
		// 		});
		// 		fetch('http://it.at.there/')
		// 			.then(res => {
		// 				expect(res.headers.get('content-length')).to.equal('100');
		// 				done();
		// 			});
		// 	});

		// });