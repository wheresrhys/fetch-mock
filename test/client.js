const fetchMock = require('../src/client.js');

require('./specs/client-only.test.js')(fetchMock);

require('./runner')(fetchMock, window, window.fetch, window.AbortController);
