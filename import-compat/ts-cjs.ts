const { default: fetchMockCore, FetchMock } = require('fetch-mock');
fetchMockCore.route('http://example.com', 200);

new FetchMock({});

