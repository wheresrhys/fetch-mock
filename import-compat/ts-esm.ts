import fetchMockCore, { FetchMock } from 'fetch-mock';
fetchMockCore.route('http://example.com', 200);

new FetchMock({});

