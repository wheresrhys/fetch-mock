const FetchMock = {};

FetchMock.calls = function (name) {
	return name ? (this._calls[name] || []) : {
		matched: this._matchedCalls,
		unmatched: this._unmatchedCalls
	};
}

FetchMock.lastCall = function (name) {
	const calls = name ? this.calls(name) : this.calls().matched;
	if (calls && calls.length) {
		return calls[calls.length - 1];
	} else {
		return undefined;
	}
}

FetchMock.lastUrl = function (name) {
	return (this.lastCall(name) || [])[0]
}

FetchMock.lastOptions = function (name) {
	return (this.lastCall(name) || [])[1]
}

FetchMock.called = function (name) {
	if (!name) {
		return !!(this._matchedCalls.length || this._unmatchedCalls.length);
	}
	return !!(this._calls[name] && this._calls[name].length);
}

FetchMock.flush = function () {
	return Promise.all(this._holdingPromises);
}

FetchMock.done = function (name) {
	const names = name ? [name] : this.routes.map(r => r.name);

	// Can't use array.every because
	// a) not widely supported
	// b) would exit after first failure, which would break the logging
	return names.map(name => {
		if (!this.called(name)) {
			console.warn(`Warning: ${name} not called`);
			return false;
		}
		// would use array.find... but again not so widely supported
		const expectedTimes = (this.routes.filter(r => r.name === name) || [{}])[0].repeat;

		if (!expectedTimes) {
			return true;
		}

		const actualTimes = this.calls(name).length;
		if (expectedTimes > actualTimes) {
			console.warn(`Warning: ${name} only called ${actualTimes} times, but ${expectedTimes} expected`);
			return false;
		} else {
			return true;
		}
	})
		.filter(bool => !bool).length === 0
};

module.exports = FetchMock;