Object.defineProperty(exports, '__esModule', { value: true });
const fetchMockCore = require('@fetch-mock/core').default;
fetchMockCore.route('http://example.com', 200);
const fetchMock = require('fetch-mock').default;
fetchMock.mock('http://example.com', 200);
