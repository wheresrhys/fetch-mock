'use strict';

let Headers;
let Request;
let Response;
let stream;
let theGlobal;
let statusTextMap;


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
			method: url.method,
			headers: (() => {
				const headers = {};
				url.headers.forEach(name => headers[name] = url.headers.name);
				return headers;
			})()
		};
	} else {
		return {
			url: url,
			method: options && options.method || 'GET',
			headers: options && options.headers
		};
	}
}

function getHeaderMatcher (expectedHeaders) {
	const expectation = Object.keys(expectedHeaders).map(k => {
		return {key: k.toLowerCase(), val: expectedHeaders[k]}
	})
	return headers => {
		if (!headers) {
			headers = {};
		}
		const lowerCaseHeaders = Object.keys(headers).reduce((obj, k) => {
			obj[k.toLowerCase()] = headers[k]
			return obj;
		}, {});
		return expectation.every(header => {
			return lowerCaseHeaders[header.key] === header.val;
		})
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

	const matchHeaders = route.headers ? getHeaderMatcher(route.headers) : (() => true);

	let matchUrl;

	if (typeof route.matcher === 'string') {

		if (route.matcher === '*') {
			matchUrl = () => true;
		} else if (route.matcher.indexOf('^') === 0) {
			const expectedUrl = route.matcher.substr(1);
			matchUrl = url => url.indexOf(expectedUrl) === 0;
		} else {
			const expectedUrl = route.matcher;
			matchUrl = url => url === expectedUrl;
		}
	} else if (route.matcher instanceof RegExp) {
		const urlRX = route.matcher;
		matchUrl = function (url) {
			return urlRX.test(url);
		};
	}

	const matcher = (url, options) => {
		const req = normalizeRequest(url, options);
		return matchHeaders(req.headers) && matchMethod(req.method) && matchUrl(req.url);
	};

	if (route.times) {
		let timesLeft = route.times;
		route.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
			if (match) {
				timesLeft--;
				return true;
			}
		}
	} else {
		route.matcher = matcher;
	}

	return route;
}

class FetchMock {
	/**
	 * constructor
	 * Sets up scoped references to configuration passed in from client/server bootstrappers
	 * @param  {Object} opts
	 */
	constructor (opts) {
		this.config = {
			sendAsJson: true
		}
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
		this.reset = this.reset.bind(this);

	}

	/**
	 * mock
	 * Replaces fetch with a stub which attempts to match calls against configured routes
	 * See README for details of parameters
	 * @return {FetchMock}          Returns the FetchMock instance, so can be chained
	 */
	mock (matcher, response, options) {

		let route;

		// Handle the variety of parameters accepted by mock (see README)

		// Old method matching signature
		if (options && /^[A-Z]+$/.test(response)) {
			throw new Error(`The API for method matching has changed.
				Now use .get(), .post(), .put(), .delete() and .head() shorthand methods,
				or pass in, e.g. {method: 'PATCH'} as a third paramter`);
		} else if (options) {
			route = Object.assign({
				matcher,
				response
			}, options);
		} else if (matcher && response) {
			route = {
				matcher,
				response
			}
		} else if (matcher && matcher.matcher) {
			route = matcher
		} else {
			throw new Error('Invalid parameters passed to fetch-mock')
		}


		this.addRoute(route);

		return this._mock();
	}

	once (matcher, response, options) {
		return this.mock(matcher, response, Object.assign({}, options, {times: 1}));
	}

	_mock () {
		// Do this here rather than in the constructor to ensure it's scoped to the test
		this.realFetch = this.realFetch || theGlobal.fetch;
		theGlobal.fetch = this.fetchMock;
		return this;
	}

	catch (response) {
		if (this.fallbackResponse) {
			console.warn(`calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response`);
		}
		this.fallbackResponse = response || 'ok';
		return this._mock();
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

		if (!response) {
			console.warn(`unmatched call to ${url}`);
			this.push(null, [url, opts]);

			if (this.fallbackResponse) {
				response = this.fallbackResponse;
			} else {
				throw new Error(`unmatched call to ${url}`)
			}
		}

		if (typeof response === 'function') {
			response = response (url, opts);
		}

		if (typeof response.then === 'function') {
			return response.then(response => this.mockResponse(url, response, opts))
		} else {
			return this.mockResponse(url, response, opts)
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
	addRoute (route) {

		if (!route) {
			throw new Error('.mock() must be passed configuration for a route')
		}

		// Allows selective application of some of the preregistered routes
		this.routes.push(compileRoute(route));
	}


	/**
	 * mockResponse
	 * Constructs a Response object to return from the mocked fetch
	 * @param  {String} url    url parameter fetch was called with
	 * @param  {Object} config configuration for the response to be constructed
	 * @return {Promise}       Promise for a Response object (or a rejected response to imitate network failure)
	 */
	mockResponse (url, responseConfig, fetchOpts) {
		// It seems odd to call this in here even though it's already called within fetchMock
		// It's to handle the fact that because we want to support making it very easy to add a
		// delay to any sort of response (including responses which are defined with a function)
		// while also allowing function responses to return a Promise for a response config.
		if (typeof responseConfig === 'function') {
			responseConfig = responseConfig(url, fetchOpts);
		}

		if (Response.prototype.isPrototypeOf(responseConfig)) {
			return Promise.resolve(responseConfig);
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
		opts.sendAsJson = responseConfig.sendAsJson === undefined ? this.config.sendAsJson : responseConfig.sendAsJson;
		if (responseConfig.status && (typeof responseConfig.status !== 'number' || parseInt(responseConfig.status, 10) !== responseConfig.status || responseConfig.status < 200 || responseConfig.status > 599)) {
			throw new TypeError(`Invalid status ${responseConfig.status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
		}
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
			this.realfetch = null;
		}
		this.fallbackResponse = null;
		this.reset();
		this.routes = [];
		return this;
	}

	/**
	 * reset
	 * Resets call history
	 */
	reset () {
		this._calls = {};
		this._matchedCalls = [];
		this._unmatchedCalls = [];
		return this;
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

	done (name) {
		const names = name ? [name] : this.routes.map(r => r.name);
		return names.every(name => {
			if (!this.called(name)) {
				return false
			}
			const expectedTimes = this.routes.find(r => r.name === name).times;
			return !expectedTimes || (expectedTimes <= this.calls(name).length)
		})
	}

	configure (opts) {
		Object.assign(this.config, opts);
	}
}

['get','post','put','delete','head', 'patch']
	.forEach(method => {
		FetchMock.prototype[method] = function (matcher, response, options) {
			return this.mock(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
		FetchMock.prototype[`${method}Once`] = function (matcher, response, options) {
			return this.once(matcher, response, Object.assign({}, options, {method: method.toUpperCase()}));
		}
	})

module.exports = FetchMock;
