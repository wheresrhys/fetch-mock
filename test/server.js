const fetchMock = require('../src/server.js');
const expect = require('chai').expect;

require('./runner')(fetchMock, global, require('node-fetch').Request, require('node-fetch').Response);

describe('support for Buffers', () => {
	it('can respond with a buffer', () => {
		fetchMock.mock(/a/, {
			sendAsJson: false,
			body: new Buffer('buffer')
		})
		return fetchMock.fetchHandler('http://a.com')
			.then(res => res.text())
			.then(txt => {
				expect(txt).to.equal('buffer');
			});
	});
});
