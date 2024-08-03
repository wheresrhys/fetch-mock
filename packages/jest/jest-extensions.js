const callsAreEqual = (c1, c2) => {
	if (!c1 && !c2) return true;
	if (!c1 || !c2) return false;
	if (c1[0] !== c2[0]) return false;
	if (c1[1] !== c2[1]) return false;
	if (c1.request !== c2.request) return false;
	if (c1.identifier !== c2.identifier) return false;
	if (c1.isUnmatched !== c2.isUnmatched) return false;
	if (c1.response !== c2.response) return false;
	return true;
};

const methodlessExtensions = {
	toHaveFetched: (fetchMock, url, options) => {
		if (fetchMock.called(url, options)) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () => `fetch should have been called with ${url}`,
		};
	},
	toHaveLastFetched: (fetchMock, url, options) => {
		const allCalls = fetchMock.calls();
		if (!allCalls.length) {
			return {
				pass: false,
				message: () => `No calls made to fetch`,
			};
		}
		const lastCall = [...allCalls].pop();
		const lastUrlCall = [...fetchMock.calls(url, options)].pop();
		if (callsAreEqual(lastCall, lastUrlCall)) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`Last call to fetch should have had a URL of ${url} but was ${lastCall.url}`,
		};
	},

	toHaveNthFetched: (fetchMock, n, url, options) => {
		const nthCall = fetchMock.calls()[n - 1];
		const urlCalls = fetchMock.calls(url, options);
		if (urlCalls.some((call) => callsAreEqual(call, nthCall))) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`${n}th call to fetch should have had a URL of ${url} but was ${nthCall.url}`,
		};
	},

	toHaveFetchedTimes: (fetchMock, times, url, options) => {
		const calls = fetchMock.calls(url, options);
		if (calls.length === times) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`fetch should have been called with a URL of ${url} ${times} times, but it was called ${calls.length} times`,
		};
	},
};

expect.extend(methodlessExtensions);
expect.extend({
	toBeDone: (fetchMock, matcher) => {
		const done = fetchMock.done(matcher);
		if (done) {
			return { pass: true };
		}
		return {
			pass: false,
			message: () =>
				`fetch has not been called the expected number of times ${
					matcher ? `for ${matcher}` : 'in total'
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
