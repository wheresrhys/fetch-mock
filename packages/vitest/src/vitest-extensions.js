import {expect} from "vitest";

const methodlessExtensions = {
	toHaveFetched: ({fetchMock}, matcher, options) => {
		if (fetchMock.callHistory.called(matcher, options)) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () => `fetch should have been called with ${matcher} and ${JSON.stringify(options)}`,
		};
	},
	toHaveLastFetched: ({fetchMock}, matcher, options) => {
		const allCalls = fetchMock.callHistory.calls();
		if (!allCalls.length) {
			return {
				pass: false,
				message: () => `No calls made to fetch`,
			};
		}
		const lastCall = [...allCalls].pop();
		const lastMatchingCall = [...fetchMock.callHistory.calls(matcher, options)].pop();
		if (lastCall === lastMatchingCall) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`Last call to fetch should have matched ${matcher} and ${JSON.stringify(options)} but was ${JSON.stringify(lastCall)}`,
		};
	},

	toHaveNthFetched: ({fetchMock}, n, matcher, options) => {
		const nthCall = fetchMock.callHistory.calls()[n - 1];
		const matchingCalls = fetchMock.callHistory.calls(matcher, options);
		if (matchingCalls.some((call) => call === nthCall)) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`${n}th call to fetch should have matched ${matcher} and ${JSON.stringify(options)} but was ${JSON.stringify(nthCall)}`,
		};
	},

	toHaveFetchedTimes: ({fetchMock}, times, matcher, options) => {
		const calls = fetchMock.callHistory.calls(matcher, options);
		if (calls.length === times) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`fetch should have made ${times} calls matching ${matcher} and ${JSON.stringify(options)}, but it only made ${calls.length}`,
		};
	},
};

expect.extend(methodlessExtensions);
expect.extend({
	toBeDone: ({fetchMock}, filter) => {
		const done = fetchMock.callHistory.done(filter);
		if (done) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`fetch has not been called the expected number of times ${
					filter ? `for ${filter}` : 'in total'
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
