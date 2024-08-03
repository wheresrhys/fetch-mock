import { vi } from 'vitest';
import { FetchMock, defaultConfig } from '@fetch-mock/core';
import './vitest-extensions';

class FetchMockVitest extends FetchMock {
	mockClear () {
		this.callHistory.clear();
		return this
	}
	mockReset ({includeSticky=false, includeFallback=true} = {}) {
		this.router.removeRoutes({includeSticky, includeFallback});
		return this.mockClear();
	}
	mockRestore(options) {
		this.unmockGlobal();
		return this.mockReset(options)
	}
}

const fetchMockVitest = new FetchMockVitest({
	...defaultConfig,
})


export function hookIntoVitestMockResetMethods() {
	const { clearAllMocks, resetAllMocks, restoreAllMocks } = vi;

	vi.clearAllMocks = () => {
		clearAllMocks.apply(vi);
		fetchMockVitest.mockClear();
	}

	vi.resetAllMocks = (options) => {
		resetAllMocks.apply(vi);
		fetchMockVitest.mockReset(options);
	}

	vi.restoreAllMocks = (options) => {
		restoreAllMocks.apply(vi);
		fetchMockVitest.mockRestore(options);
	}
}

export default fetchMockVitest;
