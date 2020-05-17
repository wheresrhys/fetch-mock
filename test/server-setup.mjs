import fetchMock from '../esm/server.js';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import http from 'http';
import { promisify } from 'util';

global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController
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
