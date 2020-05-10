import fetchMock from '../esm/server.js';
import {expect} from 'chai';
import http from 'http';
import sinon from 'sinon';
import { promisify } from 'util';
import runner from './runner.js';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import serverOnly from './specs/server-only.test.js';

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

	runner(
		fetchMock,
		global,
		fetch,
		AbortController
	);
	serverOnly(fetchMock)
});
