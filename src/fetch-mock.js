'use strict';

let Headers;
let Response;
let stream;
let Blob;
let theGlobal;
let debug;

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

	if (config.body != null && typeof body === 'object') {
		body = JSON.stringify(body);
	}

	debug('sending body "' + body + '"" for ' + url);

	if (stream) {
		let s = new stream.Readable();
		if (body != null) {
			s.push(body, 'utf-8');
		}
		s.push(null);
		body = s;
	}

	return Promise.resolve(new Response(body, opts));
}

function compileRoute (route) {

  var method = route.method;
  var matchMethod;
  if(method) {
    method = method.toLowerCase();
    matchMethod = function(options) {
      var m = options && options.method ? options.method.toLowerCase() : 'get';
      return m === method;
    };
  } else {
    matchMethod = function(){ return true; };
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

	if (typeof route.matcher === 'string') {
		let expectedUrl = route.matcher;
		if (route.matcher.indexOf('^') === 0) {
			debug('constructing starts with string matcher for route: ' + route.name);
			expectedUrl = expectedUrl.substr(1);
			route.matcher = function (url, options) {
				return matchMethod(options) && url.indexOf(expectedUrl) === 0;
			};
		} else {
			debug('constructing string matcher for route: ' + route.name);
			route.matcher = function (url, options) {
				return matchMethod(options) && url === expectedUrl;
			};
		}
	} else if (route.matcher instanceof RegExp) {
		debug('constructing regex matcher for route: ' + route.name);
		const urlRX = route.matcher;
		route.matcher = function (url, options) {
			return matchMethod(options) && urlRX.test(url);
		};
	}
	return route;
}

class FetchMock {
	constructor (opts) {
		Headers = opts.Headers;
		Response = opts.Response;
		stream = opts.stream;
		Blob = opts.Blob;
		theGlobal = opts.theGlobal;
		debug = opts.debug;
		this.routes = [];
		this._calls = {};
		this.mockedContext = theGlobal;
		this.realFetch = theGlobal.fetch && theGlobal.fetch.bind(theGlobal);
	}

	useNonGlobalFetch (func) {
		this.mockedContext = this;
		this.realFetch = func;
	}

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

	getRouter (config) {
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

	push (name, call) {
		if (name) {
			this._calls[name] = this._calls[name] || [];
			this._calls[name].push(call);
			this._matchedCalls.push(call);
		} else {
			this._unmatchedCalls.push(call);
		}
	}

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

	constructMock (config) {
		debug('constructing mock function');
		config = config || {};
		const router = this.getRouter(config);
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

	restore () {
		debug('restoring fetch');
		this.isMocking = false;
		this.mockedContext.fetch = this.realFetch;
		this.reset();
		debug('fetch restored');
	}

	reMock () {
		this.restore();
		this.mock.apply(this, [].slice.apply(arguments));
	}

	getMock () {
		return this.fetch;
	}

	reset () {
		debug('resetting call logs');
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
	}

	calls (name) {
		return name ? (this._calls[name] || []) : {
			matched: this._matchedCalls,
			unmatched: this._unmatchedCalls
		};
	}

	called (name) {
		if (!name) {
			return !!(this._matchedCalls.length);
		}
		return !!(this._calls[name] && this._calls[name].length);
	}
}

module.exports = FetchMock;
