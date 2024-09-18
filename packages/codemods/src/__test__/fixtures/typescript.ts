import fetchMock from 'fetch-mock';
function helper (res: number): {
	fetchMock.mock("blah", res)
};
