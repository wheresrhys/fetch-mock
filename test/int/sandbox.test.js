// tests for changing all the config options
// tests for sandbox and global


//chill and spy should error informatively



		// describe('sandbox', () => {
		// 	it('return function', () => {
		// 		const sbx = fetchMock.sandbox();
		// 		expect(typeof sbx).to.equal('function');
		// 	});

		// 	it('port settings from parent instance', () => {
		// 		const sbx = fetchMock.sandbox();
		// 		expect(sbx.Headers).to.equal(fetchMock.Headers)
		// 	});

		// 	it('disallow calling on part configured parent', () => {
		// 		expect(() => fetchMock.mock('url', 200).sandbox()).to.throw
		// 	});

		// 	it('implement full fetch-mock api', () => {
		// 		const sbx = fetchMock.sandbox();
		// 		expect(typeof sbx.mock).to.equal('function');
		// 	});

		// 	it('be a mock fetch implementation', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://domain.url', 200)
		// 		return sbx('http://domain.url')
		// 			.then(res => {
		// 				expect(res.status).to.equal(200);
		// 			})
		// 	});

		// 	it('don\'t interfere with global fetch', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://domain.url', 200)
		// 		expect(theGlobal.fetch).to.equal(dummyFetch);
		// 		expect(theGlobal.fetch).not.to.equal(sbx);
		// 	});

		// 	it('don\'t interfere with global fetch-mock', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://domain.url', 200)
		// 			.catch(302)

		// 		fetchMock
		// 			.mock('http://domain2.url', 200)
		// 			.catch(301)

		// 		expect(theGlobal.fetch).to.equal(fetchMock.fetchMock);
		// 		expect(fetchMock.fetchMock).not.to.equal(sbx);
		// 		expect(fetchMock.fallbackResponse).not.to.equal(sbx.fallbackResponse)

		// 		return Promise.all([
		// 			sbx('http://domain.url'),
		// 			fetch('http://domain2.url')
		// 		])
		// 			.then(responses => {
		// 				expect(responses[0].status).to.equal(200);
		// 				expect(responses[1].status).to.equal(200);
		// 				expect(sbx.called('http://domain.url')).to.be.true;
		// 				expect(sbx.called('http://domain2.url')).to.be.false;
		// 				expect(fetchMock.called('http://domain2.url')).to.be.true;
		// 				expect(fetchMock.called('http://domain.url')).to.be.false;
		// 				fetchMock.restore();
		// 				expect(sbx.called('http://domain.url')).to.be.true;
		// 			})
		// 	});

		// 	it('don\'t interfere with other sandboxes', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://domain.url', 200)
		// 			.catch(301)

		// 		const sbx2 = fetchMock
		// 			.sandbox()
		// 			.mock('http://domain2.url', 200)
		// 			.catch(302)

		// 		expect(sbx2).not.to.equal(sbx);
		// 		expect(sbx2.fallbackResponse).not.to.equal(sbx.fallbackResponse)

		// 		return Promise.all([
		// 			sbx('http://domain.url'),
		// 			sbx2('http://domain2.url')
		// 		])
		// 			.then(responses => {
		// 				expect(responses[0].status).to.equal(200);
		// 				expect(responses[1].status).to.equal(200);
		// 				expect(sbx.called('http://domain.url')).to.be.true;
		// 				expect(sbx.called('http://domain2.url')).to.be.false;
		// 				expect(sbx2.called('http://domain2.url')).to.be.true;
		// 				expect(sbx2.called('http://domain.url')).to.be.false;
		// 			})
		// 	});

		// 	it('works with global promise responses when using the global promise', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://example.com', GlobalPromise.resolve(200));

		// 		const responsePromise = sbx('http://example.com')
		// 		expect(responsePromise).to.be.instanceof(GlobalPromise);
		// 		return responsePromise.then(res => expect(res.status).to.equal(200));
		// 	});

		// 	it('works with custom promise responses when using the global promise', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.mock('http://example.com', BluebirdPromise.resolve(200));

		// 		const responsePromise = sbx('http://example.com')
		// 		expect(responsePromise).to.be.instanceof(GlobalPromise);
		// 		return responsePromise.then(res => expect(res.status).to.equal(200));
		// 	});

		// 	it('can be restored', () => {
		// 		const sbx = fetchMock
		// 			.sandbox()
		// 			.get('https://api.resin.io/foo', 200);

		// 		return sbx('https://api.resin.io/foo')
		// 			.then(res => {
		// 				expect(res.status).to.equal(200);
		// 				sbx
		// 					.restore()
		// 					.get('https://api.resin.io/foo', 500);
		// 				return sbx('https://api.resin.io/foo');
		// 			})
		// 			.then(res => expect(res.status).to.equal(500))
		// 	});

		// })