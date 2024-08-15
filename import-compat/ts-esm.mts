import fetchMockCore, { FetchMock } from '@fetch-mock/core';
fetchMockCore.route('http://example.com', 200);

new FetchMock({});

import fetchMock from 'fetch-mock';
fetchMock.mock('http://example.com', 200);
