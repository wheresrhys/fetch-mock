const { default: fetchMock, FetchMock } = require('fetch-mock');
const { default: fetchMockVitest } = require('@fetch-mock/vitest');
const { default: fetchMockJest } = require('@fetch-mock/jest');
fetchMock.route('http://example.com', 200);

new FetchMock({});
