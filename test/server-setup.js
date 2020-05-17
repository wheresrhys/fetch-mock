const http = require('http');
const { promisify } = require('util');
const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');
global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch: require('node-fetch'),
	AbortController: require('abort-controller')
}



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
