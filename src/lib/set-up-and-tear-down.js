const compileRoute = require('./compile-route');
const FetchMock = {};

FetchMock.mock = function (matcher, response, options = {}) {
	let route;

	// Handle the variety of parameters accepted by mock (see README)
	if (matcher && response) {
		route = Object.assign({
			matcher,
			response
		}, options);
	} else if (matcher && matcher.matcher) {
		route = matcher
	} else {
		throw new Error('Invalid parameters passed to fetch-mock')
	}

	this.addRoute(route);

	return this._mock();
}

FetchMock.addRoute = function (route) {
	route = this.compileRoute(route);

	let clashingRoutes = this.routes.filter(existingRoute => route.name === existingRoute.name);

	if (clashingRoutes.length) {
		const overwriteRoutes = ('overwriteRoutes' in route) ? route.overwriteRoutes : this.config.overwriteRoutes;

		if (overwriteRoutes === true) {
			clashingRoutes = clashingRoutes.filter(existingRoute => {
	  		return route.method === existingRoute.method;
	  	});
	  	this.routes.splice(this.routes.indexOf(clashingRoutes[0]), 1);
	  } else if (typeof overwriteRoutes === 'undefined') {
	  	clashingRoutes = clashingRoutes.filter(existingRoute => {
	  		return !route.method || (route.method === existingRoute.method);
	  	});

	  	if (clashingRoutes.length) {
		  	throw new Error('Adding route with same name as existing route. See `overwriteRoutes` option.');
		  }
		}
	}
	this.routes.push(route);
};

FetchMock._mock = function () {
	if (!this.isSandbox) {
		// Do this here rather than in the constructor to ensure it's scoped to the test
		this.realFetch = this.realFetch || this.global.fetch;
		this.global.fetch = this.fetchHandler;
	}
	return this;
}

FetchMock.catch = function (response) {
	if (this.fallbackResponse) {
		console.warn('calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response');// eslint-disable-line
	}
	this.fallbackResponse = response || 'ok';
	return this._mock();
}

FetchMock.spy = function () {
	if (this.isSandbox && !this.config.fetch) {
		throw 'To spy() on sandboxed fetch mock instances, set fetchMock.config.fetch to your chosen `fetch` implementation';
	}
	this._mock();
	return this.catch(this.realFetch)
}

FetchMock.compileRoute = compileRoute;

FetchMock.once = function (matcher, response, options = {}) {
	return this.mock(matcher, response, Object.assign({}, options, {repeat: 1}));
};

['get', 'post', 'put', 'delete', 'head', 'patch']
	.forEach(method => {
		FetchMock[method] = function (matcher, response, options = {}) {
			return this.mock(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
		FetchMock[`${method}Once`] = function (matcher, response, options = {}) {
			return this.once(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
	});

FetchMock.restore = function () {
	if (this.realFetch) {
		this.global.fetch = this.realFetch;
		this.realFetch = undefined;
	}
	this.fallbackResponse = undefined;
	this.routes = [];
	this.reset();
	return this;
}

FetchMock.reset = function () {
	this._calls = {};
	this._allCalls = [];
	this._holdingPromises = [];
	this.routes.forEach(route => route.reset && route.reset())
	return this;
}

module.exports = FetchMock;