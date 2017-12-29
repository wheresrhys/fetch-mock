const FetchMock = {};

FetchMock.calls = function (name) {
	return name === true ? this._matchedCalls :
		name === false ? this._unmatchedCalls :
		name ? (this._calls[name] || []) :
		this._matchedCalls.concat(this._unmatchedCalls);
}

FetchMock.lastCall = function (name) {
	return [...this.calls(name)].pop();
}

FetchMock.normalizeLastCall = function (name) {
	const call = this.lastCall(name) || [];
	if (this.config.Request.prototype.isPrototypeOf(call[0])) {
		return [call[0].url, call[0]];
	}
	return call;
}

FetchMock.lastUrl = function (name) {
	return this.normalizeLastCall(name)[0];
}

FetchMock.lastOptions = function (name) {
	return this.normalizeLastCall(name)[1];
}

FetchMock.called = function (name) {
	return !!this.calls(name).length;
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