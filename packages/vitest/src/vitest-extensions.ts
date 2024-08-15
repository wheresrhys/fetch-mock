import { expect } from 'vitest';
import { SyncExpectationResult } from '@vitest/expect';
import type {
	FetchMock,
	RouteName,
	CallHistoryFilter,
	RouteConfig,
} from '@fetch-mock/core';
const methodlessExtensions = {
	toHaveFetched: (
		{ fetchMock }: { fetchMock: FetchMock },
		filter: CallHistoryFilter,
		options: RouteConfig,
	): SyncExpectationResult => {
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
		{ fetchMock }: { fetchMock: FetchMock },
		filter: CallHistoryFilter,
		options: RouteConfig,
	): SyncExpectationResult => {
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
		{ fetchMock }: { fetchMock: FetchMock },
		n: number,
		filter: CallHistoryFilter,
		options: RouteConfig,
	): SyncExpectationResult => {
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

	// toHaveFetchedTimes: ({ fetchMock }: { fetchMock: FetchMock }, times: number, filter: CallHistoryFilter, options: RouteConfig): SyncExpectationResult => {
	// 	const calls = fetchMock.callHistory.calls(filter, options);
	// 	if (calls.length === times) {
	// 		return { pass: true, message: () => `fetch was called ${n} times as expected` };
	// 	}
	// 	return {
	// 		pass: false,
	// 		message: () =>
	// 			`fetch should have made ${times} calls matching ${filter} and ${JSON.stringify(options)}, but it only made ${calls.length}`,
	// 	};
	// },
};

expect.extend(methodlessExtensions);

expect.extend({
	toBeDone: (
		{ fetchMock }: { fetchMock: FetchMock },
		routes: RouteName | RouteName[],
	): SyncExpectationResult => {
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

[
	'Got:get',
	'Posted:post',
	'Put:put',
	'Deleted:delete',
	'FetchedHead:head',
	'Patched:patch',
].forEach((verbs) => {
	const [humanVerb, method] = verbs.split(':');

	const extensions = Object.entries(methodlessExtensions)
		.map(([name, func]) => {
			return [
				(name = name.replace('Fetched', humanVerb)),
				(...args) => {
					const opts = args[func.length - 1] || {};
					args[func.length - 1] = { ...opts, method };
					return func(...args);
				},
			];
		})
		.reduce((obj, [name, func]) => ({ ...obj, [name]: func }), {});

	expect.extend(extensions);
});
