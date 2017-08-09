'use strict';
const glob = require('glob-to-regexp')
const express = require('path-to-regexp');

const stringMatchers = {
	begin: targetString => {
		return url => url.indexOf(targetString) === 0
	},
	end: targetString => {
		return url => url.substr(-targetString.length) === targetString
	},
	glob: targetString => {
		const urlRX = glob(targetString.replace(/^glob:/, ''))
		return url => urlRX.test(url)
	},
	express: targetString => {
		const urlRX = express(targetString.replace(/^express:/, ''))
		return url => urlRX.test(url)
	}
}

function getHeaderMatcher (expectedHeaders, HeadersConstructor) {
	const expectation = Object.keys(expectedHeaders).map(k => {
		return {key: k.toLowerCase(), val: expectedHeaders[k]}
	})
	return headers => {
		if (!headers) {
			headers = {};
		}

		if (headers instanceof HeadersConstructor) {
			headers = headers.raw();
		}

		const lowerCaseHeaders = Object.keys(headers).reduce((obj, k) => {
			obj[k.toLowerCase()] = headers[k]
			return obj;
		}, {});

		return expectation.every(header => {
			return areHeadersEqual(lowerCaseHeaders, header);
		})
	}
}

function areHeadersEqual (currentHeader, expectedHeader) {
    const key = expectedHeader.key;
    const val = expectedHeader.val;
    const currentHeaderValue = (Array.isArray(currentHeader[key])) ? currentHeader[key] : [currentHeader[key]];
    const expectedHeaderValue = (Array.isArray(val)) ? val : [val];

    if (currentHeaderValue.length !== expectedHeaderValue.length) {
		return false;
    }

    for (let i = 0; i < currentHeaderValue.length; ++i) {
        if (currentHeaderValue[i] !== expectedHeaderValue[i]) {
			return false;
        }
    }

    return true;
}

function normalizeRequest (url, options, Request) {
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

module.exports = function (route, Request, HeadersConstructor) {
	route = Object.assign({}, route);

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

	let matchUrl;

	const expectedMethod = route.method && route.method.toLowerCase();

	function matchMethod (method) {
		return !expectedMethod || expectedMethod === (method ? method.toLowerCase() : 'get');
	};

	const matchHeaders = route.headers ? getHeaderMatcher(route.headers, HeadersConstructor) : (() => true);


	if (typeof route.matcher === 'function') {
		matchUrl = route.matcher;
	} else if (typeof route.matcher === 'string') {

		Object.keys(stringMatchers).some(name => {
			if (route.matcher.indexOf(name + ':') === 0) {
				const url = route.matcher.replace(new RegExp(`^${name}:`), '')
				matchUrl = stringMatchers[name](url);
				return true
			}
		})
		if (!matchUrl) {
			if (route.matcher === '*') {
				matchUrl = () => true;
			} else if (route.matcher.indexOf('^') === 0) {
				console.warn('Using \'^\' to denote the start of a url is deprecated. Use \'begin:\' instead');
				const expectedUrl = route.matcher.substr(1);
				matchUrl = url => url.indexOf(expectedUrl) === 0;
			} else {
				const expectedUrl = route.matcher;
				matchUrl = url => url === expectedUrl;
			}
		}
	} else if (route.matcher instanceof RegExp) {
		const urlRX = route.matcher;
		matchUrl = function (url) {
			return urlRX.test(url);
		};
	}

	const matcher = (url, options) => {
		const req = normalizeRequest(url, options, Request);
		return matchHeaders(req.headers) && matchMethod(req.method) && matchUrl(req.url, options);
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
		route.reset = () => timesLeft = route.times;
	} else {
		route.matcher = matcher;
	}

	return route;
}
