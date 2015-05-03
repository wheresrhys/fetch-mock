'use strict';

require('fetch');

var fetchMock = require('../client.js');

require('./spec')(fetchMock, window);