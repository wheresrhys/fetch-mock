'use strict';

require('whatwg-fetch');

var fetchMock = require('../src/client.js');

require('./spec')(fetchMock, window);