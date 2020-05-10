const fetchMock = require('../src/client.js');
const expect = require('chai').expect;

require('./specs/client-only.test.js')(fetchMock)

require('./runner')(fetchMock, window, window.fetch, window.AbortController);
