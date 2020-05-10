const fetchMock = require(process.env.FETCH_MOCK_SRC || '../src/server.js');

describe('nodejs tests', () => {
	require('./runner')(
		fetchMock,
		global,
		require('node-fetch'),
		require('abort-controller')
	);
	require('./specs/server-only.test.js')(fetchMock);
});
