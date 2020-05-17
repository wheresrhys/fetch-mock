const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};
