import { vi } from 'vitest';
import {
	FetchMock,
	defaultFetchMockConfig,
	RemoveRouteOptions,
} from 'fetch-mock';
import './vitest-extensions';

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
	const { clearAllMocks, resetAllMocks, restoreAllMocks, unstubAllGlobals } =
		vi;

	vi.clearAllMocks = () => {
		clearAllMocks.apply(vi);
		fetchMockVitest.mockClear();
		return vi;
	};

	vi.resetAllMocks = () => {
		resetAllMocks.apply(vi);
		fetchMockVitest.mockReset();
		return vi;
	};

	vi.restoreAllMocks = () => {
		restoreAllMocks.apply(vi);
		fetchMockVitest.mockRestore();
		return vi;
	};

	vi.unstubAllGlobals = () => {
		unstubAllGlobals.apply(vi);
		fetchMockVitest.mockRestore();
		return vi;
	};
}

const fetchMockVitest = new FetchMockVitest({
	...defaultFetchMockConfig,
});

export default fetchMockVitest;
