const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');
const expect = require('chai').expect;
const http = require('http');
const sinon = require('sinon');
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

	require('./runner')(
		fetchMock,
		global,
		require('node-fetch'),
		require('abort-controller')
	);
	require('./specs/server-only.test.js')(fetchMock)
});
