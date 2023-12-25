import {
  default as fetch,
  Headers,
  Request,
  Response,
} from 'node-fetch';

import AbortController from 'abort-controller';
import fetchMock from '../../src/server.js';

fetchMock.config = Object.assign(fetchMock.config, {
	Promise,
	Request,
	Response,
	Headers,
	fetch,
});

globalThis.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};
