'use strict';

let Headers;
let Request;
let Response;
let stream;
let theGlobal;
let statusTextMap;

/**
 * mockResponse
 * Constructs a Response object to return from the mocked fetch
 * @param  {String} url    url parameter fetch was called with
 * @param  {Object} config configuration for the response to be constructed
 * @return {Promise}       Promise for a Response object (or a rejected response to imitate network failure)
 */
function mockResponse (url, responseConfig, fetchOpts) {

	// It seems odd to call this in here even though it's already called within fetchMock
	// It's to handle the fact that because we want to support making it very easy to add a
	// delay to any sort of response (including responses which are defined with a function)
	// while also allowing function responses to return a Promise for a response config.
	if (typeof responseConfig === 'function') {
		responseConfig = responseConfig(url, fetchOpts);
	}

	if (responseConfig.throws) {
		return Promise.reject(responseConfig.throws);
	}

	if (typeof responseConfig === 'number') {
		responseConfig = {
			status: responseConfig
		};
	} else if (typeof responseConfig === 'string' || !(responseConfig.body || responseConfig.headers || responseConfig.throws || responseConfig.status)) {
		responseConfig = {
			body: responseConfig
		};
	}

	const opts = responseConfig.opts || {};
	opts.url = url;
	opts.sendAsJson = responseConfig.sendAsJson === undefined ? true : responseConfig.sendAsJson;
	opts.status = responseConfig.status || 200;
	opts.statusText = statusTextMap['' + opts.status];
	// The ternary operator is to cope with new Headers(undefined) throwing in Chrome
	// https://code.google.com/p/chromium/issues/detail?id=335871
	opts.headers = responseConfig.headers ? new Headers(responseConfig.headers) : new Headers();

	let body = responseConfig.body;
	if (opts.sendAsJson && responseConfig.body != null && typeof body === 'object') { //eslint-disable-line
		body = JSON.stringify(body);
	}

	if (stream) {
		let s = new stream.Readable();
		if (body != null) { //eslint-disable-line
			s.push(body, 'utf-8');
		}
		s.push(null);
		body = s;
	}

	return Promise.resolve(new Response(body, opts));
}

/**
 * normalizeRequest
 * Given the parameters fetch was called with, normalises Request or url + options pairs
 * to a standard container object passed to matcher functions
 * @param  {String|Request} url
 * @param  {Object} 				options
 * @return {Object}         {url, method}
 */
function normalizeRequest (url, options) {
	if (Request.prototype.isPrototypeOf(url)) {
		return {
			url: url.url,
			method: url.method
		};
	} else {
		return {
			url: url,
			method: options && options.method || 'GET'
		};
	}
}

/**
 * compileRoute
 * Given a route configuration object, validates the object structure and compiles
 * the object into a {name, matcher, response} triple
 * @param  {Object} route route config
 * @return {Object}       {name, matcher, response}
 */
function compileRoute (route) {

	if (typeof route.response === 'undefined') {
		throw new Error('Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error('each route must specify a string, regex or function to match calls to fetch');
	}

	if (!route.name) {
		route.name = route.matcher.toString();
		route.__unnamed = true;
	}

	// If user has provided a function as a matcher we assume they are handling all the
	// matching logic they need
	if (typeof route.matcher === 'function') {
		return route;
	}

	const expectedMethod = route.method && route.method.toLowerCase();

	function matchMethod (method) {
		return !expectedMethod || expectedMethod === (method ? method.toLowerCase() : 'get');
	};

	let matchUrl;

	if (typeof route.matcher === 'string') {

		if (route.matcher.indexOf('^') === 0) {
			const expectedUrl = route.matcher.substr(1);
			matchUrl = function (url) {
				return url.indexOf(expectedUrl) === 0;
			};
		} else {
			const expectedUrl = route.matcher;
			matchUrl = function (url) {
				return url === expectedUrl;
			};
		}
	} else if (route.matcher instanceof RegExp) {
		const urlRX = route.matcher;
		matchUrl = function (url) {
			return urlRX.test(url);
		};
	}

	route.matcher = function (url, options) {
		const req = normalizeRequest(url, options);
		return matchMethod(req.method) && matchUrl(req.url);
	};

	return route;
}

class FetchMock {
	/**
	 * constructor
	 * Sets up scoped references to configuration passed in from client/server bootstrappers
	 * @param  {Object} opts
	 */
	constructor (opts) {
		Headers = opts.Headers;
		Request = opts.Request;
		Response = opts.Response;
		stream = opts.stream;
		theGlobal = opts.theGlobal;
		statusTextMap = opts.statusTextMap;
		this.routes = [];
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
		this.fetchMock = this.fetchMock.bind(this);
		this.restore = this.restore.bind(this);
		this.reMock = this.reMock.bind(this);
		this.reset = this.reset.bind(this);
	}

	/**
	 * useNonGlobalFetch
	 * Sets fetchMock's default internal reference to native fetch to the given function
	 * @param  {Function} func
	 */
	useNonGlobalFetch (func) {
		this.mockedContext = this;
		this.realFetch = func;
		return this;
	}

	/**
	 * mock
	 * Replaces fetch with a stub which attempts to match calls against configured routes
	 * See README for details of parameters
	 * @return {FetchMock}          Returns the FetchMock instance, so can be chained
	 */
	mock (matcher, method, response) {
		// Do this here rather than in the constructor to ensure it's scoped to the test
		this.realFetch = this.realFetch || (theGlobal.fetch && theGlobal.fetch.bind(theGlobal));
		let config;
		// Handle the variety of parameters accepted by mock (see README)
		if (response) {
			config = {
				routes: [{
					matcher,
					method,
					response
				}]
			}
		} else if (method) {
			config = {
				routes: [{
					matcher,
					response: method
				}]
			}
		} else if (matcher instanceof Array) {
			config = {
				routes: matcher
			}
		} else if (matcher && matcher.matcher) {
			config = {
				routes: [matcher]
			}
		} else {
			config = matcher;
		}

		this.addRoutes(config.routes);
		this.greed = config.greed || this.greed || 'none';
		theGlobal.fetch = this.fetchMock;
		return this;
	}

	/**
	 * constructMock
	 * Constructs a function which attempts to match fetch calls against routes (see constructRouter)
	 * and handles success or failure of that attempt accordingly
	 * @param  {Object} config See README
	 * @return {Function}      Function expecting url + options or a Request object, and returning
	 *                         a promise of a Response, or forwading to native fetch
	 */
	fetchMock (url, opts) {

		let response = this.router(url, opts);

		if (response) {

			if (typeof response === 'function') {
				response = response (url, opts);
			}

			if (response instanceof Promise) {
				return response.then(response => mockResponse(url, response, opts))
			} else {
				return mockResponse(url, response, opts)
			}
		} else {
			console.warn(`unmatched call to ${url}`);
			this.push(null, [url, opts]);
			if (this.greed === 'good') {
				return mockResponse(url, {body: 'unmocked url: ' + url});
			} else if (this.greed === 'bad') {
				return mockResponse(url, {throws: 'unmocked url: ' + url});
			} else {
				if (!this.realFetch) {
					throw new Error('fetch not defined in this environment. To mock unmatched calls set `greed: good` in your options');
				}
				return this.realFetch(url, opts);
			}
		}

	}
	/**
	 * router
	 * Given url + options or a Request object, checks to see if ait is matched by any routes and returns
	 * config for a response or undefined.
	 * @param  {String|Request} url
	 * @param  {Object}
	 * @return {Object}
	 */
	router (url, opts) {
		let route;
		for (let i = 0, il = this.routes.length; i < il ; i++) {
			route = this.routes[i];
			if (route.matcher(url, opts)) {
				this.push(route.name, [url, opts]);
				return route.response;
			}
		}
	}

	/**
	 * addRoutes
	 * Adds routes to those used by fetchMock to match fetch calls
	 * @param  {Object|Array} routes 	route configurations
	 */
	addRoutes (routes) {

		if (!routes) {
			throw new Error('.mock() must be passed configuration for routes')
		}

		if (!(routes instanceof Array)) {
			routes = [routes];
		}

		// Allows selective application of some of the preregistered routes
		this.routes = this.routes.concat(routes.map(compileRoute));
	}

	/**
	 * push
	 * Records history of fetch calls
	 * @param  {String} name Name of the route matched by the call
	 * @param  {Array} call [url, opts] pair
	 */
	push (name, call) {
		if (name) {
			this._calls[name] = this._calls[name] || [];
			this._calls[name].push(call);
			this._matchedCalls.push(call);
		} else {
			this._unmatchedCalls.push(call);
		}
	}

	/**
	 * restore
	 * Restores global fetch to its initial state and resets call history
	 */
	restore () {
		if (this.realFetch) {
			theGlobal.fetch = this.realFetch;
		}
		this.reset();
		this.routes = [];
	}

	/**
	 * reMock
	 * Same as .mock(), but also calls .restore() internally
	 * @return {FetchMock}          Returns the FetchMock instance, so can be chained
	 */
	reMock () {
		this.restore();
		return this.mock.apply(this, [].slice.apply(arguments));
	}

	/**
	 * getMock
	 * Returns a reference to the stub function used to mock fetch
	 * @return {Function}
	 */
	getMock () {
		return this.fetchMock;
	}

	/**
	 * reset
	 * Resets call history
	 */
	reset () {
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
	}

	/**
	 * calls
	 * Returns call history. See README
	 */
	calls (name) {
		return name ? (this._calls[name] || []) : {
			matched: this._matchedCalls,
			unmatched: this._unmatchedCalls
		};
	}

	lastCall (name) {
		const calls = name ? this.calls(name) : this.calls().matched;
		if (calls && calls.length) {
			return calls[calls.length - 1];
		} else {
			return undefined;
		}
	}

	lastUrl (name) {
		const call = this.lastCall(name);
		return call && call[0];
	}

	lastOptions (name) {
		const call = this.lastCall(name);
		return call && call[1];
	}

	/**
	 * called
	 * Returns whether fetch has been called matching a configured route. See README
	 */
	called (name) {
		if (!name) {
			return !!(this._matchedCalls.length);
		}
		return !!(this._calls[name] && this._calls[name].length);
	}
}

module.exports = FetchMock;
