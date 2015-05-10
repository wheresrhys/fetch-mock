'use strict';

var sinon = require('sinon');
var Headers;
var Response;
var stream;
var Blob;
var theGlobal;


function mockResponse (url, config) {
	// allow just body to be passed in as this is the commonest use case
	if (typeof config === 'number') {
		config = {
			status: config
		};
	} else if (typeof config === 'string' || !(config.body || config.headers || config.throws || config.status)) {
		config = {
			body: config
		};
	}
	if (config.throws) {
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
			expectedUrl = expectedUrl.substr(1);
			route.matcher = function (url) {
				return url.indexOf(expectedUrl) === 0;
			};
		} else {
			route.matcher = function (url) {
				return url === expectedUrl;
			};
		}
	} else if (route.matcher instanceof RegExp) {
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
	this.routes = this.routes.concat(routes.map(compileRoute));
};

FetchMock.prototype.unregisterRoute = function (name) {
	var names;
	if (!name) {
		this.routes = [];
		return;
	}
	if (name instanceof Array) {
		names = name;
	} else {
		names = [name];
	}

	this.routes = this.routes.filter(function (route) {
		return names.indexOf(route.name)  === -1;
	});
};

FetchMock.prototype.getRouter = function (config) {
	var routes;

	if (config.routes) {
		if (!(config.routes instanceof Array)) {
			config.routes = [config.routes];
		}

		var preRegisteredRoutes = {};
		this.routes.forEach(function (route) {
			preRegisteredRoutes[route.name] = route;
		});
		routes = config.routes.map(function (route) {
			if (typeof route === 'string') {
				return preRegisteredRoutes[route];
			} else {
				return compileRoute(route);
			}
		});
	} else {
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

		routes.some(function (route) {

			if (route.matcher(url, opts)) {
				this.push(route.name, [url, opts]);
				response = config.responses[route.name] || route.response;
				if (typeof response === 'function') {
					response = response(url, opts);
				}
				return true;
			}
		}.bind(this));
		return response;
	}.bind(this);
};

FetchMock.prototype.push = function (name, call) {
	this._calls[name] = this._calls[name] || [];
	this._calls[name].push(call);
};

FetchMock.prototype.mock = function (config) {
	var self = this;
	if (this.isMocking) {
		throw 'fetch-mock is already mocking routes. Call .restore() before mocking again';
	}

	this.isMocking = true;
	config = config || {};
	var defaultFetch = theGlobal.fetch;
	var router = this.getRouter(config);
	config.greed = config.greed || 'none';

	sinon.stub(theGlobal, 'fetch', function (url, opts) {
			var response = router(url, opts);
			if (response) {
				return mockResponse(url, response);
			} else {
				self.push('__unmatched', [url, opts]);
				if (config.greed === 'good') {
					return mockResponse(url, {body: 'unmocked url: ' + url});
				} else if (config.greed === 'bad') {
					return mockResponse(url, {throws: 'unmocked url: ' + url});
				} else {
					return defaultFetch(url, opts);
				}
			}
	});
};

FetchMock.prototype.restore = function () {
	this.isMocking = false;
	this.reset();
	theGlobal.fetch.restore();
};

FetchMock.prototype.reMock = function (config) {
	this.restore();
	this.mock(config);
};

FetchMock.prototype.reset = function () {
	this._calls = {};
	theGlobal.fetch.reset();
};

FetchMock.prototype.calls = function (name) {
	return this._calls[name] || [];
};

FetchMock.prototype.called = function (name) {
	return !!(this._calls[name] && this._calls[name].length);
};

module.exports = FetchMock;
