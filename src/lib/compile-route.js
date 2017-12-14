'use strict';
const glob = require('glob-to-regexp')
const express = require('path-to-regexp');

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

const stringMatchers = {
	begin: targetString => {
		return ({ url }) => url.indexOf(targetString) === 0
	},
	end: targetString => {
		return ({ url }) => url.substr(-targetString.length) === targetString
	},
	glob: targetString => {
		const urlRX = glob(targetString)
		return ({ url }) => urlRX.test(url)
	},
	express: targetString => {
		const urlRX = express(targetString)
		return ({ url }) => urlRX.test(url)
	}
}

const headersToLowerCase = headers => Object.keys(headers).reduce((obj, k) => {
	obj[k.toLowerCase()] = headers[k]
	return obj;
}, {});


function areHeadersEqual (actualHeader, expectedHeader) {
	actualHeader = Array.isArray(actualHeader) ? actualHeader : [actualHeader];
	expectedHeader = Array.isArray(expectedHeader) ? expectedHeader : [expectedHeader];

	if (actualHeader.length !== expectedHeader.length) {
		return false;
	}

	return actualHeader.every((val, i) => val === expectedHeader[i])
}

function getHeaderMatcher ({ headers: expectedHeaders }, Headers) {
	if (!expectedHeaders) {
		return () => true;
	}
	const expectation = headersToLowerCase(expectedHeaders);

	return ({ headers = {} }) => {

		if (headers instanceof Headers) {
			headers = headers.raw();
		}

		const lowerCaseHeaders = headersToLowerCase(headers);

		return Object.keys(expectation).every(headerName => {
			return areHeadersEqual(lowerCaseHeaders[headerName], expectation[headerName]);
		})
	}
}

const getMethodMatcher = route => {
	const expectedMethod = route.method && route.method.toLowerCase();

	return ({ method }) => {
		return !expectedMethod || expectedMethod === (method ? method.toLowerCase() : 'get');
	};
}

const getUrlMatcher = route => {

	if (typeof route.matcher === 'function') {
		const matcher = route.matcher;
		return ({ url }, options) => matcher(url, options);
	}

	if (route.matcher instanceof RegExp) {
		const urlRX = route.matcher;
		return ({ url }) => urlRX.test(url);
	}

	if (route.matcher === '*') {
		return () => true;
	}

	if (route.matcher.indexOf('^') === 0) {
		throw new Error('Using \'^\' to denote the start of a url is deprecated. Use \'begin:\' instead');
	}

	for (let shorthand in stringMatchers) {
		if (route.matcher.indexOf(shorthand + ':') === 0) {
			const url = route.matcher.replace(new RegExp(`^${shorthand}:`), '')
			return stringMatchers[shorthand](url);
		}
	}

	const expectedUrl = route.matcher;
	return ({ url }) => url === expectedUrl;
}

module.exports = function (route) {
	route = Object.assign({}, route);

	if (typeof route.response === 'undefined') {
		throw new Error('Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error('Each route must specify a string, regex or function to match calls to fetch');
	}

	if (!route.name) {
		route.name = route.matcher.toString();
		route.__unnamed = true;
	}

	const matchers = [
		getMethodMatcher(route),
		getHeaderMatcher(route, this.config.Headers),
		getUrlMatcher(route)
	];

	const matcher = (url, options) => {
		const req = normalizeRequest(url, options, this.config.Request);
		return matchers.every(matcher => matcher(req, options));
	};

	if (route.repeat) {
		let timesLeft = route.repeat;
		route.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
			if (match) {
				timesLeft--;
				return true;
			}
		}
		route.reset = () => timesLeft = route.repeat;
	} else {
		route.matcher = matcher;
	}

	return route;
}
