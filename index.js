'use strict';

var Response = require('node-fetch').Response;
var Headers = require('node-fetch').Headers;
var sinon = require('sinon');
var stream = require('stream');

function mockResponse (url, config) {
	// allow just body to be passed in as this is the commonest use case
	if (typeof config === 'string' || !(config.body || config.headers || config.throws || config.status)) {
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

	var s = new stream.Readable();
	if (config.body != null) {
		var body = config.body;
		if (typeof body === 'object') {
			body = JSON.stringify(body);
		}
		s.push(body, 'utf-8');
	}

	s.push(null);
	return Promise.resolve(new Response(s, opts));
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

var FetchMock = function () {
	this.routes = [];
	this._calls = {};
};

FetchMock.prototype.registerRoute = function (name, matcher, response) {
	var routes;
	if (name instanceof Array) {
		routes = name;
	} else {
		routes = [{
			name: name,
			matcher: matcher,
			response: response
		}];
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
		var routeNames = {};
		config.routes.forEach(function (route) {
			if (routeNames[route.name]) {
				throw 'Route names must be unique';
			}
			routeNames[route.name] = true;
		})
	} else {
		routes = this.routes;
	}

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

	var defaultFetch = GLOBAL.fetch;
	var router = this.getRouter(config);
	config.greed = config.greed || 'none';

	sinon.stub(GLOBAL, 'fetch', function (url, opts) {
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
	GLOBAL.fetch.restore();
};

FetchMock.prototype.reset = function () {
	this._calls = {};
	GLOBAL.fetch.reset();
};

FetchMock.prototype.calls = function (name) {
	return this._calls[name] || [];
};

FetchMock.prototype.called = function (name) {
	return !!(this._calls[name] && this._calls[name].length);
};

module.exports = new FetchMock();
