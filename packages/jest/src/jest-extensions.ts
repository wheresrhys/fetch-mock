import { expect } from '@jest/globals';
import type { SyncExpectationResult } from 'expect';
import {
	FetchMock,
	RouteName,
	CallHistoryFilter,
	UserRouteConfig,
} from 'fetch-mock';
import {
	HumanVerbMethodNames,
	HumanVerbs,
	PatchedFetch,
	RawFetchMockMatchers,
} from './types.js';

function getFetchMockFromInput(input: PatchedFetch | FetchMock) {
	const fetchMock = (input as PatchedFetch)['fetchMock']
		? (input as PatchedFetch).fetchMock
		: input;
	if (!fetchMock || !(fetchMock instanceof FetchMock)) {
		throw new Error(
			'Unable to get fetchMock instance!  Please make sure you passed a patched fetch or fetchMock!',
		);
	}
	return fetchMock;
}

const methodlessExtensions: Pick<
	RawFetchMockMatchers,
	HumanVerbMethodNames<'Fetched'>
> = {
	toHaveFetched: (
		input: PatchedFetch | FetchMock,
		filter: CallHistoryFilter,
		options: UserRouteConfig,
	): SyncExpectationResult => {
		const fetchMock = getFetchMockFromInput(input);
		if (fetchMock.callHistory.called(filter, options)) {
			return { pass: true, message: () => 'fetch was called as expected' };
		}
		return {
			pass: false,
			message: () =>
				`fetch should have been called with ${filter} and ${JSON.stringify(options)}`,
		};
	},
	toHaveLastFetched: (
		input: PatchedFetch | FetchMock,
		filter: CallHistoryFilter,
		options: UserRouteConfig,
	): SyncExpectationResult => {
		const fetchMock = getFetchMockFromInput(input);
		const allCalls = fetchMock.callHistory.calls();
		if (!allCalls.length) {
			return {
				pass: false,
				message: () => `No calls made to fetch`,
			};
		}
		const lastCall = [...allCalls].pop();
		const lastMatchingCall = [
			...fetchMock.callHistory.calls(filter, options),
		].pop();
		if (lastCall === lastMatchingCall) {
			return { pass: true, message: () => 'fetch was last called as expected' };
		}
		return {
			pass: false,
			message: () =>
				`Last call to fetch should have matched ${filter} and ${JSON.stringify(options)} but was ${JSON.stringify(lastCall)}`,
		};
	},

	toHaveNthFetched: (
		input: PatchedFetch | FetchMock,
		n: number,
		filter: CallHistoryFilter,
		options: UserRouteConfig,
	): SyncExpectationResult => {
		const fetchMock = getFetchMockFromInput(input);
		const nthCall = fetchMock.callHistory.calls()[n - 1];
		const matchingCalls = fetchMock.callHistory.calls(filter, options);
		if (matchingCalls.some((call) => call === nthCall)) {
			return {
				pass: true,
				message: () => `fetch's ${n}th call was as expected`,
			};
		}
		return {
			pass: false,
			message: () =>
				`${n}th call to fetch should have matched ${filter} and ${JSON.stringify(options)} but was ${JSON.stringify(nthCall)}`,
		};
	},

	toHaveFetchedTimes: (
		input: PatchedFetch | FetchMock,
		times: number,
		filter: CallHistoryFilter,
		options: UserRouteConfig,
	): SyncExpectationResult => {
		const fetchMock = getFetchMockFromInput(input);
		const calls = fetchMock.callHistory.calls(filter, options);
		if (calls.length === times) {
			return {
				pass: true,
				message: () => `fetch was called ${times} times as expected`,
			};
		}
		return {
			pass: false,
			message: () =>
				`fetch should have made ${times} calls matching ${filter} and ${JSON.stringify(options)}, but it only made ${calls.length}`,
		};
	},
};

expect.extend(methodlessExtensions);

expect.extend({
	toBeDone: (
		input: PatchedFetch | FetchMock,
		routes: RouteName | RouteName[],
	): SyncExpectationResult => {
		const fetchMock = getFetchMockFromInput(input);
		const done = fetchMock.callHistory.done(routes);
		if (done) {
			return { pass: true, message: () => '' };
		}
		return {
			pass: false,
			message: () =>
				`fetch has not been called the expected number of times ${
					routes ? `for ${routes}` : 'in total'
				}`,
		};
	},
});

function scopeExpectationFunctionToMethod<
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	Fn extends (...args: any[]) => SyncExpectationResult,
>(
	func: Fn,
	method: string,
): (...args: Parameters<Fn>) => SyncExpectationResult {
	return (...args) => {
		const opts = args[func.length - 1] || {};
		args[func.length - 1] = { ...opts, method };
		return func(...args);
	};
}

function scopeExpectationNameToMethod(name: string, humanVerb: string): string {
	return name.replace('Fetched', humanVerb);
}

const expectMethodNameToMethodMap: {
	[humanVerb in Exclude<HumanVerbs, 'Fetched'>]: string;
} = {
	Got: 'get',
	Posted: 'post',
	Put: 'put',
	Deleted: 'delete',
	FetchedHead: 'head',
	Patched: 'patch',
};

Object.entries(expectMethodNameToMethodMap).forEach(([humanVerb, method]) => {
	const extensions = Object.fromEntries(
		Object.entries(methodlessExtensions).map(([name, func]) => [
			scopeExpectationNameToMethod(name, humanVerb),
			scopeExpectationFunctionToMethod(func, method),
		]),
	) as Omit<RawFetchMockMatchers, HumanVerbMethodNames<'Fetched'> | 'toBeDone'>;

	expect.extend(extensions);
});
