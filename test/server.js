'use strit';

require('es6-promise').polyfill();

var fetchMock = require('../server.js');

require('./spec')(fetchMock, GLOBAL);