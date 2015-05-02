'use strict';

require('es6-promise').polyfill();

var Response = require('node-fetch/lib/response');
var Headers = require('node-fetch/lib/headers');
var sinon = require('sinon');
var stream = require('stream');

function mockResponse (url, config) {
	if (config.throws) {
		return Promise.reject(config.throws);
	}
	opts = config.opts || {};
	opts.url = url;
	opts.status = opts.status || 200;
	opts.headers = opts.headers ? new Headers(opts.headers) : new Headers();

	var s = new stream.Readable();
	if (config.body != null) {
		var body = config.body;
		if (typeof body === 'object') {
			body = JSON.stringify(body);
		}
		s.push(body);
	}

	s.push(null);

	return Promise.resolve(new Response(s, opts));
}

function compileRoute (route) {
	if (typeof route.matcher === 'string') {
		var expectedUrl = route.matcher
		route.matcher = function (url) {
			return url === expectedUrl;
		}
	} else if (route.matcher instanceof RegExp) {
		var urlRX = route.matcher
		route.matcher = function (url) {
			return urlRX.test(url);
		}
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
		}]
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

}

FetchMock.prototype.getRouter = function (config) {
	var routes;

	if (config.routes) {
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

	opts.responses = opts.responses || {};

	return function (url, opts) {
		var response;
		routes.some(function (route) {
			if (route.matcher(url, opts)) {
				this._calls[route.name] = this.calls[route.name] || [];
				this._calls[route.name].push([url, opts]);
				response = opts.responses || route.response;
				if (typeof response === 'function') {
					response = response(url, opts);
				}
				return true;
			}
		});
		return response;
	}
};

FetchMock.prototype.mock = function (config) {
	var defaultFetch = GLOBAL.fetch;
	var router = this.getRouter(config);
	config.greed = config.greed || 'none';
	sinon.stub(GLOBAL, 'fetch', function (url, opts) {
			var response = router(url, opts);
			if (response) {
				return mockResponse(url, response);
			} else if (config.greed === 'good') {
				return mockResponse(url, {body: 'unmocked url :' + url});
			} else if (config.greed === 'bad') {
				return mockResponse(url, {throws: 'unmocked url :' + url});
			} else {
				return defaultFetch(url, opts);
			}
	});
};

FetchMock.prototype.restore = function () {
	this.reset();
	GLOBAL.fetch.restore();
};

FetchMock.prototype.reset = function () {
	this.calls = {};
	GLOBAL.fetch.reset();
};

FetchMock.prototype.calls = function (name) {
	return this._calls[name];
};

FetchMock.prototype.called = function (name) {
	return !!(this._calls[name] && this._calls[name].length);
};


module.exports = new FetchMock();
