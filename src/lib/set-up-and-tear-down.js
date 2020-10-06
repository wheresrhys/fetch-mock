const { debug, setDebugPhase } = require('./debug');
const FetchMock = {};

FetchMock.mock = function (...args) {
	setDebugPhase('setup');
	if (args.length) {
		this.addRoute(args);
	}

	return this._mock();
};

FetchMock.addRoute = function (uncompiledRoute) {
	debug('Adding route', uncompiledRoute);
	const route = this.compileRoute(uncompiledRoute);
	const clashes = this.routes.filter(({ identifier, method }) => {
		const isMatch =
			typeof identifier === 'function'
				? identifier === route.identifier
				: String(identifier) === String(route.identifier);
		return isMatch && (!method || !route.method || method === route.method);
	});

	if (this.getOption('overwriteRoutes', route) === false || !clashes.length) {
		this._uncompiledRoutes.push(uncompiledRoute);
		return this.routes.push(route);
	}

	if (this.getOption('overwriteRoutes', route) === true) {
		clashes.forEach((clash) => {
			const index = this.routes.indexOf(clash);
			this._uncompiledRoutes.splice(index, 1, uncompiledRoute);
			this.routes.splice(index, 1, route);
		});
		return this.routes;
	}

	if (clashes.length) {
		throw new Error(
			'fetch-mock: Adding route with same name or matcher as existing route. See `overwriteRoutes` option.'
		);
	}

	this._uncompiledRoutes.push(uncompiledRoute);
	this.routes.push(route);
};

FetchMock._mock = function () {
	if (!this.isSandbox) {
		// Do this here rather than in the constructor to ensure it's scoped to the test
		this.realFetch = this.realFetch || this.global.fetch;
		this.global.fetch = this.fetchHandler;
	}
	setDebugPhase();
	return this;
};

FetchMock.catch = function (response) {
	if (this.fallbackResponse) {
		console.warn(
			'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response'
		); // eslint-disable-line
	}
	this.fallbackResponse = response || 'ok';
	return this._mock();
};

FetchMock.spy = function (route) {
	// even though ._mock() is called by .mock() and .catch() we still need to
	// call it here otherwise .getNativeFetch() won't be able to use the reference
	// to .realFetch that ._mock() sets up
	this._mock();
	return route
		? this.mock(route, this.getNativeFetch())
		: this.catch(this.getNativeFetch());
};

const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
	FetchMock[methodName] = function (matcher, response, options) {
		return this[underlyingMethod](
			matcher,
			response,
			Object.assign(options || {}, shorthandOptions)
		);
	};
};

const defineGreedyShorthand = (methodName, underlyingMethod) => {
	FetchMock[methodName] = function (response, options) {
		return this[underlyingMethod]({}, response, options);
	};
};

defineShorthand('sticky', 'mock', { sticky: true });
defineShorthand('once', 'mock', { repeat: 1 });
defineGreedyShorthand('any', 'mock');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
	defineShorthand(method, 'mock', { method });
	defineShorthand(`${method}Once`, 'once', { method });
	defineGreedyShorthand(`${method}Any`, method);
	defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
});

const mochaAsyncHookWorkaround = (options) => {
	// HACK workaround for this https://github.com/mochajs/mocha/issues/4280
	// Note that it doesn't matter that we call it _before_ carrying out all
	// the things resetBehavior does as everything in there is synchronous
	if (typeof options === 'function') {
		console.warn(`Deprecated: Passing fetch-mock reset methods
directly in as handlers for before/after test runner hooks.
Wrap in an arrow function instead e.g. \`() => fetchMock.restore()\``);
		options();
	}
};

const getRouteRemover = ({ sticky: removeStickyRoutes }) => (routes) =>
	removeStickyRoutes ? [] : routes.filter(({ sticky }) => sticky);

FetchMock.resetBehavior = function (options = {}) {
	mochaAsyncHookWorkaround(options);
	const removeRoutes = getRouteRemover(options);

	this.routes = removeRoutes(this.routes);
	this._uncompiledRoutes = removeRoutes(this._uncompiledRoutes);

	if (this.realFetch && !this.routes.length) {
		this.global.fetch = this.realFetch;
		this.realFetch = undefined;
	}

	this.fallbackResponse = undefined;
	return this;
};

FetchMock.resetHistory = function () {
	this._calls = [];
	this._holdingPromises = [];
	this.routes.forEach((route) => route.reset && route.reset());
	return this;
};

FetchMock.restore = FetchMock.reset = function (options) {
	this.resetBehavior(options);
	this.resetHistory();
	return this;
};

module.exports = FetchMock;
