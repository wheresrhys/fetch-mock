const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');
global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch: require('node-fetch'),
	AbortComtroller: require('abort-controller')
}
