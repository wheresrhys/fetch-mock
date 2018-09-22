const { normalizeUrl } = require('./request-utils');
const FetchMock = {};
const compileRoute = require('./compile-route');

const isName = nameOrMatcher =>
	typeof nameOrMatcher === 'string' && /^[\da-z\-]+$/.test(nameOrMatcher);

FetchMock.filterCallsWithMatcher = function(matcher, options = {}, calls) {
	matcher = compileRoute(
		// HACK: add dummy response so that we can generate a matcher without
		// copileRoute's expectation that each route has a response defined
		Object.assign({ matcher, response: 200 }, options)
	).matcher;
	return calls.filter(([url, opts]) => matcher(normalizeUrl(url), opts));
};

FetchMock.filterCalls = function(nameOrMatcher, options) {
	let calls;
	let matcher = '*';

	if (nameOrMatcher === true) {
		calls = this._calls.filter(({ unmatched }) => !unmatched);
	} else if (nameOrMatcher === false) {
		calls = this._calls.filter(({ unmatched }) => unmatched);
	} else if (typeof nameOrMatcher === 'undefined') {
		calls = this._calls;
	} else if (isName(nameOrMatcher)) {
		calls = this._calls.filter(({ name }) => name === nameOrMatcher);
	} else {
		matcher = normalizeUrl(nameOrMatcher);
		calls = this._calls.filter(call => call.matcher === matcher);
	}

	if (options && calls.length) {
		if (typeof options === 'string') {
			options = { method: options };
		}
		calls = this.filterCallsWithMatcher(matcher, options, calls);
	}
	return calls;
};

FetchMock.calls = function(nameOrMatcher, options) {
	return this.filterCalls(nameOrMatcher, options);
};

FetchMock.lastCall = function(nameOrMatcher, options) {
	return [...this.filterCalls(nameOrMatcher, options)].pop();
};

FetchMock.lastUrl = function(nameOrMatcher, options) {
	return (this.lastCall(nameOrMatcher, options) || [])[0];
};

FetchMock.lastOptions = function(nameOrMatcher, options) {
	return (this.lastCall(nameOrMatcher, options) || [])[1];
};

FetchMock.called = function(nameOrMatcher, options) {
	return !!this.filterCalls(nameOrMatcher, options).length;
};

FetchMock.flush = function(waitForResponseMethods) {
	const queuedPromises = this._holdingPromises;
	this._holdingPromises = [];

	return Promise.all(queuedPromises).then(() => {
		if (waitForResponseMethods && this._holdingPromises.length) {
			return this.flush(waitForResponseMethods);
		}
	});
};

FetchMock.done = function(name, options) {
	const names = name && typeof name !== 'boolean' ? [{ name }] : this.routes;

	// Can't use array.every because
	// a) not widely supported
	// b) would exit after first failure, which would break the logging
	return (
		names
			.map(({ name, method }) => {
				// HACK - this is horrible. When the api is eventually updated to update other
				// filters other than a method string it will break... but for now it's ok-ish
				method = options || method;

				if (!this.called(name, method)) {
					console.warn(`Warning: ${name} not called`); // eslint-disable-line
					return false;
				}

				// would use array.find... but again not so widely supported
				const expectedTimes = (this.routes.filter(
					r => r.name === name && r.method === method
				) || [{}])[0].repeat;
				if (!expectedTimes) {
					return true;
				}

				const actualTimes = this.filterCalls(name, method).length;
				if (expectedTimes > actualTimes) {
					console.warn(
						`Warning: ${name} only called ${actualTimes} times, but ${expectedTimes} expected`
					); // eslint-disable-line
					return false;
				} else {
					return true;
				}
			})
			.filter(bool => !bool).length === 0
	);
};

module.exports = FetchMock;
