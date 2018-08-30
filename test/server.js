const fetchMock = require('../src/server.js');
const expect = require('chai').expect;
const http = require('http');
const { promisify } = require('util');

describe('nodejs tests', () => {
	let server;
	before(() => {
		server = http.createServer((req, res) => {
			res.writeHead(200);
			res.end();
		});

		return promisify(server.listen.bind(server))(9876);
	});
	after(() => {
		server.close();
	});

	require('./runner')(fetchMock, global, require('node-fetch'));

	describe('support for Buffers', () => {
		it('can respond with a buffer', () => {
			fetchMock.mock(/a/, new Buffer('buffer'), { sendAsJson: false });
			return fetchMock
				.fetchHandler('http://a.com')
				.then(res => res.text())
				.then(txt => {
					expect(txt).to.equal('buffer');
				});
		});
	});
});
