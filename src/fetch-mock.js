'use strict';

let Headers;
let Request;
let Response;
let stream;
let theGlobal;
let debug;

/**
 * mockResponse
 * Constructs a Response object to return from the mocked fetch
 * @param  {String} url    url parameter fetch was called with
 * @param  {Object} config configuration for the response to be constructed
 * @return {Promise}       Promise for a Response object (or a rejected response to imitate network failure)
 */
function mockResponse (url, config) {
	debug('mocking response for ' + url);

	if (config.throws) {
		debug('mocking failed request for ' + url);
		return Promise.reject(config.throws);
	}

	if (typeof config === 'number') {
		debug('status response detected for ' + url);
		config = {
			status: config
		};
	} else if (typeof config === 'string' || !(config.body || config.headers || config.throws || config.status)) {
		debug('body response detected for ' + url);
		config = {
			body: config
		};
	} else {
		debug('full config response detected for ' + url);
	}

	const opts = config.opts || {};
	opts.url = url;
	opts.status = config.status || 200;
	// The ternary operator is to cope with new Headers(undefined) throwing in Chrome
	// https://code.google.com/p/chromium/issues/detail?id=335871
	opts.headers = config.headers ? new Headers(config.headers) : new Headers();

	let body = config.body;
	/*eslint-disable*/
	if (config.body != null && typeof body === 'object') {
	/*eslint-enable*/
		body = JSON.stringify(body);
	}

	debug('sending body "' + body + '"" for ' + url);

	if (stream) {
		let s = new stream.Readable();
		/*eslint-disable*/
		if (body != null) {
		/*eslint-enable*/
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

	debug('compiling route: ' + route.name);

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
			debug('constructing starts with string matcher for route: ' + route.name);
			const expectedUrl = route.matcher.substr(1);
			matchUrl = function (url) {
				return url.indexOf(expectedUrl) === 0;
			};
		} else {
			debug('constructing string matcher for route: ' + route.name);
			const expectedUrl = route.matcher;
			matchUrl = function (url) {
				return url === expectedUrl;
			};
		}
	} else if (route.matcher instanceof RegExp) {
		debug('constructing regex matcher for route: ' + route.name);
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
		debug = opts.debug;
		this.routes = [];
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
		this.mockedContext = theGlobal;
		this.realFetch = theGlobal.fetch && theGlobal.fetch.bind(theGlobal);
	}

	/**
	 * useNonGlobalFetch
	 * Sets fetchMock's default internal reference to native fetch to the given function
	 * @param  {Function} func
	 */
	useNonGlobalFetch (func) {
		this.mockedContext = this;
		this.realFetch = func;
	}

	/**
	 * mock
	 * Replaces fetch with a stub which attempts to match calls against configured routes
	 * See README for details of parameters
	 * @return {FetchMock}          Returns the FetchMock instance, so can be chained
	 */
	mock (matcher, method, response) {

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

		debug('mocking fetch');

		this.addRoutes(config.routes);

		if (this.isMocking) {
			return this;
		}

		this.isMocking = true;

		this.mockedContext.fetch = this.constructMock(config);
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
	constructMock (config) {
		debug('constructing mock function');
		config = config || {};
		this.addRoutes(config.routes);
		config.greed = config.greed || 'none';

		const mock = (url, opts) => {
			const response = this.router(url, opts);
			if (response) {
				debug('response found for ' + url);
				return mockResponse(url, response);
			} else {
				debug('response not found for ' + url);
				this.push(null, [url, opts]);
				if (config.greed === 'good') {
					debug('sending default good response');
					return mockResponse(url, {body: 'unmocked url: ' + url});
				} else if (config.greed === 'bad') {
					debug('sending default bad response');
					return mockResponse(url, {throws: 'unmocked url: ' + url});
				} else {
					debug('forwarding to default fetch');
					return this.realFetch(url, opts);
				}
			}
		};

		return mock;
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
		let response;
		debug('searching for matching route for ' + url);
		this.routes.some(route => {

			if (route.matcher(url, opts)) {
				debug('Found matching route (' + route.name + ') for ' + url);
				this.push(route.name, [url, opts]);

				debug('Setting response for ' + route.name);
				response = route.response;

				if (typeof response === 'function') {
					debug('Constructing dynamic response for ' + route.name);
					response = response(url, opts);
				}
				return true;
			}
		});

		debug('returning response for ' + url);
		return response;
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

		debug('applying one time only routes');
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
		debug('restoring fetch');
		this.isMocking = false;
		this.mockedContext.fetch = this.realFetch;
		this.reset();
		this.routes = [];
		debug('fetch restored');
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
		return this.fetch;
	}

	/**
	 * reset
	 * Resets call history
	 */
	reset () {
		debug('resetting call logs');
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
