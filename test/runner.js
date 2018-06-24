module.exports = (fetchMock, theGlobal, fetch) => {
	describe('fetch-mock', () => {
		require('./specs/set-up-and-tear-down.test')(fetchMock);
		require('./specs/global-fetch.test')(fetchMock, theGlobal);
		require('./specs/sandbox.test')(fetchMock, theGlobal);
		require('./specs/routing.test')(fetchMock);
		require('./specs/responses.test')(fetchMock);
		require('./specs/inspecting.test')(fetchMock);
		require('./specs/repeat.test')(fetchMock);
		require('./specs/custom-implementations.test')(fetchMock);
		require('./specs/options.test')(fetchMock, theGlobal, fetch);
	});
}
