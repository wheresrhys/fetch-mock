const FetchMock = {};

FetchMock.mock = function (matcher, response, options) {

	let route;

	// Handle the variety of parameters accepted by mock (see README)
	if (matcher && response && options) {
		route = Object.assign({
			matcher,
			response
		}, options);
	} else if (matcher && response) {
		route = {
			matcher,
			response
		}
	} else if (matcher && matcher.matcher) {
		route = matcher
	} else {
		throw new Error('Invalid parameters passed to fetch-mock')
	}

	this.routes.push(this.compileRoute(route));

	return this._mock();
}

FetchMock.catch = function (response) {
	if (this.fallbackResponse) {
		console.warn(`calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response`);
	}
	this.fallbackResponse = response || 'ok';
	return this._mock();
}

FetchMock.spy = function () {
	this._mock();
	return this.catch(this.realFetch)
}

FetchMock.chill = function () {
	this._mock();
	this.config.warnOnFallback = false;
	return this.catch(this.realFetch)
}

FetchMock.once = function (matcher, response, options) {
	return this.mock(matcher, response, Object.assign({}, options, {repeat: 1}));
};

['get','post','put','delete','head', 'patch']
	.forEach(method => {
		FetchMock[method] = function (matcher, response, options) {
			return this.mock(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
		FetchMock[`${method}Once`] = function (matcher, response, options) {
			return this.once(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
	})

FetchMock.flush = function () {
	return Promise.all(this._holdingPromises);
}

FetchMock.restore = function () {
	this._unMock();
	this.reset();
	this.routes = [];
	return this;
}

FetchMock.reset = function () {
	this._calls = {};
	this._matchedCalls = [];
	this._unmatchedCalls = [];
	this._holdingPromises = [];
	this.routes.forEach(route => route.reset && route.reset())
	return this;
}

module.exports = FetchMock;