const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const http = require('http');
const { promisify } = require('util');

global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};

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
