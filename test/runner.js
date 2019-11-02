import setUpAndTearDown from './specs/set-up-and-tear-down.test';
import globalFetch from './specs/global-fetch.test';
import sandbox from './specs/sandbox.test';
import routing from './specs/routing.test';
import responses from './specs/responses.test';
import inspecting from './specs/inspecting.test';
import repeat from './specs/repeat.test';
import customImplementations from './specs/custom-implementations.test';
import options from './specs/options.test';
import abortable from './specs/abortable.test';


export default (fetchMock, theGlobal, fetch, AbortController) => {
	describe('fetch-mock', () => {
		setUpAndTearDown(fetchMock);
		globalFetch(fetchMock, theGlobal);
		sandbox(fetchMock, theGlobal);
		routing(fetchMock);
		responses(fetchMock);
		inspecting(fetchMock);
		repeat(fetchMock);
		customImplementations(fetchMock);
		options(fetchMock, theGlobal, fetch);
		abortable(fetchMock, AbortController);
	});
};
