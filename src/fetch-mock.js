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

	debug('compiling route: ' + route.name);

	if (!route.name) {
		throw 'each route must be named';
	}

	if (!route.matcher) {
		throw 'each route must specify a string, regex or function to match calls to fetch';
	}

	if (typeof route.response === 'undefined') {
		throw 'each route must define a response';
	}

	if (typeof route.matcher === 'string') {
		let expectedUrl = route.matcher;
		if (route.matcher.indexOf('^') === 0) {
			debug('constructing starts with string matcher for route: ' + route.name);
			expectedUrl = expectedUrl.substr(1);
			route.matcher = function (url) {
				return url.indexOf(expectedUrl) === 0;
			};
		} else {
			debug('constructing string matcher for route: ' + route.name);
			route.matcher = function (url) {
				return url === expectedUrl;
			};
		}
	} else if (route.matcher instanceof RegExp) {
		debug('constructing regex matcher for route: ' + route.name);
		const urlRX = route.matcher;
		route.matcher = function (url) {
			return urlRX.test(url);
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
		this.realFetch = theGlobal.fetch;
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
			routes = this.routes;
		}


		const routeNames = {};
		routes.forEach(route => {
			if (routeNames[route.name]) {
				throw 'Route names must be unique';
			}
			routeNames[route.name] = true;
		});

		config.responses = config.responses || {};

		return (url, opts) => {
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
	}

	push (name, call) {
		this._calls[name] = this._calls[name] || [];
		this._calls[name].push(call);
	}

	mock (name, matcher, response) {

		let config;
		if (response) {

			config = {
				routes: [{
					name,
					matcher,
					response
				}]
			}

		} else if (matcher) {
			config = {
				routes: [{
					name: '_mock',
					matcher: name,
					response: matcher
				}]
			}

		} else if (name instanceof Array) {
			config = {
				routes: name
			}
		} else if (name && name.matcher) {
			config = {
				routes: [name]
			}
		} else {
			config = name;
		}

		debug('mocking fetch');

		if (this.isMocking) {
			throw 'fetch-mock is already mocking routes. Call .restore() before mocking again or use .reMock() if this is intentional';
		}

		this.isMocking = true;

		return this.mockedContext.fetch = this.constructMock(config);
	}

	constructMock (config) {
		debug('constructing mock function');
		config = config || {};
		const router = this.getRouter(config);
		config.greed = config.greed || 'none';

		return (url, opts) => {
			const response = router(url, opts);
			if (response) {
				debug('response found for ' + url);
				return mockResponse(url, response);
			} else {
				debug('response not found for ' + url);
				this.push('__unmatched', [url, opts]);
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

	reset () {
		debug('resetting call logs');
		this._calls = {};
	}

	calls (name) {
		return name ? (this._calls[name] || []) : (this._calls._mock || this._calls);
	}

	called (name) {
		if (!name) {
			return !!Object.keys(this._calls).length;
		}
		return !!(this._calls[name] && this._calls[name].length);
	}
}

module.exports = FetchMock;
