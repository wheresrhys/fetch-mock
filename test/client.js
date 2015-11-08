'use strict';

require('whatwg-fetch');

var fetchMock = require('../client.js');

require('./spec')(fetchMock, window);