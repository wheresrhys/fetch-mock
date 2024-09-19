import fetchMock from 'fetch-mock';
function helper (res: number): void {
	fetchMock.mock("blah", res);
};
