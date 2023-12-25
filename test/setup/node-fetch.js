import {
  default as fetch,
  Headers,
  Request,
  Response,
} from 'node-fetch';

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
	fetch,
};
