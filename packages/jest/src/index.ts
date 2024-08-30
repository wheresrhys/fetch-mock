import { jest } from '@jest/globals';
import {
	FetchMock,
	defaultFetchMockConfig,
	RemoveRouteOptions,
} from '@fetch-mock/core';
import './jest-extensions';

type MockResetOptions = {
	includeSticky: boolean;
};

class FetchMockVitest extends FetchMock {
	mockClear() {
		this.clearHistory();
		return this;
	}
	mockReset(options: MockResetOptions = { includeSticky: false }) {
		this.removeRoutes({
			...options,
			includeFallback: true,
		} as RemoveRouteOptions);
		return this.mockClear();
	}
	mockRestore(options?: MockResetOptions) {
		this.unmockGlobal();
		return this.mockReset(options);
	}
}

export function manageFetchMockGlobally() {
	const { clearAllMocks, resetAllMocks, restoreAllMocks } =
		jest;

	jest.clearAllMocks = () => {
		clearAllMocks.apply(jest);
		fetchMockVitest.mockClear();
		return jest;
	};

	jest.resetAllMocks = () => {
		resetAllMocks.apply(jest);
		fetchMockVitest.mockReset();
		return jest;
	};

	jest.restoreAllMocks = () => {
		restoreAllMocks.apply(jest);
		fetchMockVitest.mockRestore();
		return jest;
	};

}

const fetchMockVitest = new FetchMockVitest({
	...defaultFetchMockConfig,
});

export default fetchMockVitest;
