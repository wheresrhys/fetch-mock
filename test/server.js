const fetchMock = require('../src/server.js');
const expect = require('chai').expect;

require('./spec')(fetchMock, global, require('node-fetch').Request, require('node-fetch').Response);
require('./custom-header.spec')(fetchMock, global, require('node-fetch').Headers);

describe('support for Buffers', function () {
	it('can respond with a buffer', function () {
		fetchMock.mock(/a/, {
			sendAsJson: false,
			body: new Buffer('buffer')
		})
		return fetch('http://a.com')
			.then(res => res.text())
			.then(txt => {
				expect(txt).to.equal('buffer');
			});
	});
});
