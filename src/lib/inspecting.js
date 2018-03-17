const FetchMock = {};

FetchMock.callsFilteredByName = function (name) {
	if (name === true) {
		return this._allCalls.filter(call => !call.unmatched);
	}
	if (name === false) {
		return this._allCalls.filter(call => call.unmatched);
	}

	if (typeof name === 'undefined') {
		return this._allCalls;
	}

	if (this._calls[name]) {
		return this._calls[name];
	}
	return this._allCalls.filter(([url]) => url === name || url.url === name);
}

FetchMock.calls = function (name, options = {}) {
	if (typeof options === 'string') {
		options = {method: options};
	}

	let calls = this.callsFilteredByName(name);

	if (options.method) {
		const testMethod = options.method.toLowerCase();
		calls = calls.filter(([url, opts = {}]) => {
			const method = (url.method || opts.method || 'get').toLowerCase();
			return method === testMethod;
		});
	}
	return calls;

}

FetchMock.lastCall = function (name, options) {
	return [...this.calls(name, options)].pop();
}

FetchMock.normalizeLastCall = function (name, options) {
	const call = this.lastCall(name, options) || [];
	if (this.config.Request.prototype.isPrototypeOf(call[0])) {
		return [call[0].url, call[0]];
	}
	return call;
}

FetchMock.lastUrl = function (name, options) {
	return this.normalizeLastCall(name, options)[0];
}

FetchMock.lastOptions = function (name, options) {
	return this.normalizeLastCall(name, options)[1];
}

FetchMock.called = function (name, options) {
	return !!this.calls(name, options).length;
}

FetchMock.flush = function () {
	return Promise.all(this._holdingPromises);
}

FetchMock.done = function (name, options) {
	const names = name && typeof name !== 'boolean' ? [ { name } ] : this.routes;

	// Can't use array.every because
	// a) not widely supported
	// b) would exit after first failure, which would break the logging
	return names.map(({ name, method }) => {
		// HACK - this is horrible. When the api is eventually updated to update other
		// filters other than a method string it will break... but for now it's ok-ish
		method = options || method;

		if (!this.called(name, method)) {
			console.warn(`Warning: ${name} not called`);// eslint-disable-line
			return false;
		}

		// would use array.find... but again not so widely supported
		const expectedTimes = (this.routes.filter(r => r.name === name && r.method === method) || [{}])[0].repeat;
		if (!expectedTimes) {
			return true;
		}

		const actualTimes = this.calls(name, method).length;
		if (expectedTimes > actualTimes) {
			console.warn(`Warning: ${name} only called ${actualTimes} times, but ${expectedTimes} expected`);// eslint-disable-line
			return false;
		} else {
			return true;
		}
	})
		.filter(bool => !bool).length === 0
};

module.exports = FetchMock;
