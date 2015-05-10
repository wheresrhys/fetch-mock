'use strict';

var sinon = require('sinon');
var Headers;
var Response;
var stream;
var Blob;
var theGlobal;
var debug = require('debug')('fetch-mock')

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
	var opts = config.opts || {};
	opts.url = url;
	opts.status = config.status || 200;
	opts.headers = config.headers ? new Headers(config.headers) : new Headers();

	var body = config.body;
	if (config.body != null && typeof body === 'object') {
		body = JSON.stringify(body);
	}

	debug('sending body "' + body + '"" for ' + url);
	if (stream) {
		var s = new stream.Readable();
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
		var expectedUrl = route.matcher;
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
		var urlRX = route.matcher;
		route.matcher = function (url) {
			return urlRX.test(url);
		};
	}
	return route;
}

var FetchMock = function (opts) {
	Headers = opts.Headers;
	Response = opts.Response;
	stream = opts.stream;
	Blob = opts.Blob;
	theGlobal = opts.theGlobal;
	this.routes = [];
	this._calls = {};
};

FetchMock.prototype.registerRoute = function (name, matcher, response) {
	debug('registering routes');
	var routes;
	if (name instanceof Array) {
		routes = name;
	} else if (arguments.length === 3 ) {
		routes = [{
			name: name,
			matcher: matcher,
			response: response
		}];
	} else {
		routes = [name];
	}

	debug('registering routes: ' + routes.map(function (r) {return r.name}));

	this.routes = this.routes.concat(routes.map(compileRoute));
};

FetchMock.prototype.unregisterRoute = function (names) {

	if (!names) {
		debug('unregistering all routes');
		this.routes = [];
		return;
	}
	if (!(names instanceof Array)) {
		names = [names];
	}

	debug('unregistering routes: ' + names);

	this.routes = this.routes.filter(function (route) {
		var keep = names.indexOf(route.name) === -1;
		if (!keep) {
			debug('unregistering route ' + route.name);
		}
		return keep;
	});
};

FetchMock.prototype.getRouter = function (config) {
	debug('building router');
	var routes;

	if (config.routes) {
		debug('applying one time only routes');
		if (!(config.routes instanceof Array)) {
			config.routes = [config.routes];
		}

		var preRegisteredRoutes = {};
		this.routes.forEach(function (route) {
			preRegisteredRoutes[route.name] = route;
		});
		routes = config.routes.map(function (route) {
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


	var routeNames = {};
	routes.forEach(function (route) {
		if (routeNames[route.name]) {
			throw 'Route names must be unique';
		}
		routeNames[route.name] = true;
	});

	config.responses = config.responses || {};

	return function (url, opts) {
		var response;
		debug('searching for matching route for ' + url);
		routes.some(function (route) {

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
		}.bind(this));

		debug('returning response for ' + url);
		return response;
	}.bind(this);
};

FetchMock.prototype.push = function (name, call) {
	this._calls[name] = this._calls[name] || [];
	this._calls[name].push(call);
};

FetchMock.prototype.mock = function (config) {
	debug('mocking fetch');
	var self = this;
	if (this.isMocking) {
		throw 'fetch-mock is already mocking routes. Call .restore() before mocking again or use .reMock() if this is intentional';
	}

	this.isMocking = true;
	config = config || {};
	var defaultFetch = theGlobal.fetch;
	var router = this.getRouter(config);
	config.greed = config.greed || 'none';

	debug('applying sinon.stub to fetch')
	sinon.stub(theGlobal, 'fetch', function (url, opts) {
			var response = router(url, opts);
			if (response) {
				debug('response found for ' + url);
				return mockResponse(url, response);
			} else {
				debug('response not found for ' + url);
				self.push('__unmatched', [url, opts]);
				if (config.greed === 'good') {
					debug('sending default good response');
					return mockResponse(url, {body: 'unmocked url: ' + url});
				} else if (config.greed === 'bad') {
					debug('sending default bad response');
					return mockResponse(url, {throws: 'unmocked url: ' + url});
				} else {
					debug('forwarding to default fetch');
					return defaultFetch(url, opts);
				}
			}
	});
};

FetchMock.prototype.restore = function () {
	debug('restoring fetch');
	this.isMocking = false;
	this.reset();
	theGlobal.fetch.restore();
	debug('fetch restored');
};

FetchMock.prototype.reMock = function (config) {
	this.restore();
	this.mock(config);
};

FetchMock.prototype.reset = function () {
	debug('resetting call logs');
	this._calls = {};
	theGlobal.fetch.reset();
	debug('call logs reset');
};

FetchMock.prototype.calls = function (name) {
	return this._calls[name] || [];
};

FetchMock.prototype.called = function (name) {
	return !!(this._calls[name] && this._calls[name].length);
};

module.exports = FetchMock;
