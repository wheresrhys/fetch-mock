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
	// allow just body to be passed in as this is the commonest use case
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

	if (config.throws) {
		debug('mocking failed request for ' + url);
		return Promise.reject(config.throws);
	}

	const opts = config.opts || {};
	opts.url = url;
	opts.status = config.status || 200;
	// the ternary oprator is to cope with new Headers(undefined) throwing in chrome
	// (unclear to me if this is a bug or if the specification says this is correct behaviour)
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

  let expectedMethod = route.method && route.method.toLowerCase();
  let matchMethod;
  if (expectedMethod) {
    matchMethod = function (method) {
      return expectedMethod === (method ? method.toLowerCase() : 'get');
    };
  } else {
    matchMethod = function () { return true; };
  }

	debug('compiling route: ' + route.name);

	if (!route.matcher) {
		throw 'each route must specify a string, regex or function to match calls to fetch';
	}

	if (!route.name) {
		route.name = route.matcher.toString();
		route.__unnamed = true;
	}

	if (typeof route.response === 'undefined') {
		throw 'each route must define a response';
	}

	if (typeof route.matcher === 'function') {
		return route;
	}

	let matchUrl;

	if (typeof route.matcher === 'string') {
		let expectedUrl = route.matcher;
		if (route.matcher.indexOf('^') === 0) {
			debug('constructing starts with string matcher for route: ' + route.name);
			expectedUrl = expectedUrl.substr(1);
			matchUrl = function (url) {
				return url.indexOf(expectedUrl) === 0;
			};
		} else {
			debug('constructing string matcher for route: ' + route.name);
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

		if (this.isMocking) {
			this.mockedContext.fetch.augment(config.routes);
			return this;
		}

		this.isMocking = true;
		this._matchedCalls = [];
		this._unmatchedCalls = [];

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
	 *                         Has a helper method .augment(routes), which can be used to add additional
	 *                         routes to the router
	 */
	constructMock (config) {
		debug('constructing mock function');
		config = config || {};
		const router = this.constructRouter(config);
		config.greed = config.greed || 'none';

		const mock = (url, opts) => {
			const response = router(url, opts);
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

		mock.augment = function (routes) {
			router.augment(routes);
		}

		return mock;
	}

	/**
	 * constructRouter
	 * Constructs a function which identifies if calls to fetch match any of the configured routes
	 * and returns the Response defined by the route
	 * @param  {Object} config Can define routes and/or responses, which will be used to augment any
	 *                         previously set by registerRoute()
	 * @return {Function}      Function expecting url + options or a Request object, and returning
	 *                         a promise of a Response or undefined.
	 *                         Has a helper method .augment(routes), which can be used to add additional
	 *                         routes to the router
	 */
	constructRouter (config) {
		debug('building router');

		let routes;

		if (config.routes) {
			debug('applying one time only routes');
			if (!(config.routes instanceof Array)) {
				config.routes = [config.routes];
			}

			const preRegisteredRoutes = {};
			this.routes.forEach(route => {
				preRegisteredRoutes[route.name] = route;
			});
			routes = config.routes.map(route => {
				if (typeof route === 'string') {
					debug('applying preregistered route ' + route);
					return preRegisteredRoutes[route];
				} else {
					debug('applying one time route ' + route.name);
					return compileRoute(route);
				}
			});
		} else {
			debug('no one time only routes defined. Using preregistered routes only');
			routes = [].slice.call(this.routes);
		}


		const routeNames = {};
		routes.forEach(route => {
			if (routeNames[route.name]) {
				throw 'Route names must be unique';
			}
			routeNames[route.name] = true;
		});

		config.responses = config.responses || {};

		const router = (url, opts) => {
			let response;
			debug('searching for matching route for ' + url);
			routes.some(route => {

				if (route.matcher(url, opts)) {
					debug('Found matching route (' + route.name + ') for ' + url);
					this.push(route.name, [url, opts]);

					if (config.responses[route.name]) {
						debug('Overriding response for ' + route.name);
						response = config.responses[route.name];
					} else {
						debug('Using default response for ' + route.name);
						response = route.response;
					}

					if (typeof response === 'function') {
						debug('Constructing dynamic response for ' + route.name);
						response = response(url, opts);
					}
					return true;
				}
			});

			debug('returning response for ' + url);
			return response;
		};

		router.augment = function (additionalRoutes) {
			routes = routes.concat(additionalRoutes.map(compileRoute));
		}

		return router;
	}

	/**
	 * push
	 * Records history of fetch calls
	 * @param  {String} name Name of the route matched by the call
	 * @param  {Object} call {url, opts} pair
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

	/**
	 * registerRoute
	 * Creates a route that will persist even when fetchMock.restore() is called
	 * See README for details of parameters
	 */
	registerRoute (name, matcher, response) {
		debug('registering routes');
		let routes;
		if (name instanceof Array) {
			routes = name;
		} else if (arguments.length === 3 ) {
			routes = [{
				name,
				matcher,
				response,
			}];
		} else {
			routes = [name];
		}

		debug('registering routes: ' + routes.map(r => r.name));

		this.routes = this.routes.concat(routes.map(compileRoute));
	}

	/**
	 * unregisterRoute
	 * Removes a persistent route
	 * See README for details of parameters
	 */
	unregisterRoute (names) {

		if (!names) {
			debug('unregistering all routes');
			this.routes = [];
			return;
		}
		if (!(names instanceof Array)) {
			names = [names];
		}

		debug('unregistering routes: ' + names);

		this.routes = this.routes.filter(route => {
			const keep = names.indexOf(route.name) === -1;
			if (!keep) {
				debug('unregistering route ' + route.name);
			}
			return keep;
		});
	}
}

module.exports = FetchMock;
