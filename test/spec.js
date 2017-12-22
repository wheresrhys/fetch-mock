module.exports = (fetchMock, theGlobal, Request, Response) => {

	describe('fetch-mock', () => {

		const dummyFetch = () => Promise.resolve(arguments);

		before(() => {
			theGlobal.fetch = dummyFetch;
		})

		require('./int/set-up-and-tear-down.test')(fetchMock)
		require('./int/global-fetch.test')(fetchMock, theGlobal)
	});
}
