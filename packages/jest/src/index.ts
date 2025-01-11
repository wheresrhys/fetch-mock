import {
	FetchMock,
	defaultFetchMockConfig,
	RemoveRouteOptions,
} from 'fetch-mock';
import './jest-extensions.js';
import type { Jest } from '@jest/environment';
import type { FetchMockMatchers } from './types.js';
export { FetchMockMatchers } from './types.js';

type MockResetOptions = {
	includeSticky: boolean;
};

class FetchMockJest extends FetchMock {
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

export function manageFetchMockGlobally(jest: Jest) {
	const { clearAllMocks, resetAllMocks, restoreAllMocks } = jest;

	jest.clearAllMocks = () => {
		clearAllMocks.apply(jest);
		fetchMockJest.mockClear();
		return jest;
	};

	jest.resetAllMocks = () => {
		resetAllMocks.apply(jest);
		fetchMockJest.mockReset();
		return jest;
	};

	jest.restoreAllMocks = () => {
		restoreAllMocks.apply(jest);
		fetchMockJest.mockRestore();
		return jest;
	};
}

const fetchMockJest = new FetchMockJest({
	...defaultFetchMockConfig,
});

export default fetchMockJest;

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Export types on the expect object
 */
declare global {
	namespace jest {
		// Type-narrow expect for FetchMock
		interface Expect {
			(actual: FetchMock): FetchMockMatchers & {
				not: FetchMockMatchers;
			};
			(actual: typeof fetch): FetchMockMatchers & {
				not: FetchMockMatchers;
			};
		}
	}
}
/* eslint-enable @typescript-eslint/no-namespace */

declare module '@jest/expect' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Matchers<R> extends FetchMockMatchers<R> {}
}
