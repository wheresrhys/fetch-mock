import { vi } from 'vitest';
import {
	FetchMock,
	defaultFetchMockConfig,
	RemoveRouteOptions,
} from '@fetch-mock/core';
import './vitest-extensions';

type MockResetOptions = {
	includeSticky: boolean;
}


class FetchMockVitest extends FetchMock {
	mockClear() {
		this.clearHistory();
		return this;
	}
	mockReset(options: MockResetOptions = { includeSticky: false }) {
		this.removeRoutes({...options, includeFallback: true} as RemoveRouteOptions);
		return this.mockClear();
	}
	mockRestore(options?: MockResetOptions) {
		this.unmockGlobal();
		return this.mockReset(options);
	}
}

export function manageFetchMockGlobally() {
	const { clearAllMocks, resetAllMocks, restoreAllMocks } = vi;

	vi.clearAllMocks = () => {
		clearAllMocks.apply(vi);
		fetchMockVitest.mockClear();
		return vi;
	};

	vi.resetAllMocks = (options?: MockResetOptions) => {
		resetAllMocks.apply(vi);
		fetchMockVitest.mockReset(options);
		return vi;
	};

	vi.restoreAllMocks = (options?: MockResetOptions) => {
		restoreAllMocks.apply(vi);
		fetchMockVitest.mockRestore(options);
		return vi;
	};
}

const fetchMockVitest = new FetchMockVitest({
	...defaultFetchMockConfig,
});

export default fetchMockVitest;
