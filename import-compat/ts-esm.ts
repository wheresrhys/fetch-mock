import fetchMock, { FetchMock } from 'fetch-mock';
import fetchMockVitest from '@fetch-mock/vitest';
import fetchMockJest from '@fetch-mock/jest';
fetchMock.route('http://example.com', 200);

new FetchMock({});
