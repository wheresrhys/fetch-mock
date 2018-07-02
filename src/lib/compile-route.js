const glob = require('glob-to-regexp');
const express = require('path-to-regexp');
const URL = require('url');
const querystring = require('querystring');

function normalizeRequest(url, options, Request) {
	if (Request.prototype.isPrototypeOf(url)) {
		return {
			url: url.url,
			method: url.method,
			headers: (() => {
				const headers = {};
				url.headers.forEach(name => (headers[name] = url.headers.name));
				return headers;
			})()
		};
	} else {
		return {
			url: url,
			method: (options && options.method) || 'GET',
			headers: options && options.headers
		};
	}
}

const stringMatchers = {
	begin: targetString => {
		return ({ url }) => url.indexOf(targetString) === 0;
	},
	end: targetString => {
		return ({ url }) => url.substr(-targetString.length) === targetString;
	},
	glob: targetString => {
		const urlRX = glob(targetString);
		return ({ url }) => urlRX.test(url);
	},
	express: targetString => {
		const urlRX = express(targetString);
		return ({ url }) => urlRX.test(url);
	}
};

const headersToLowerCase = headers =>
	Object.keys(headers).reduce((obj, k) => {
		obj[k.toLowerCase()] = headers[k];
		return obj;
	}, {});

function areHeadersEqual(actualHeader, expectedHeader) {
	actualHeader = Array.isArray(actualHeader) ? actualHeader : [actualHeader];
	expectedHeader = Array.isArray(expectedHeader)
		? expectedHeader
		: [expectedHeader];

	if (actualHeader.length !== expectedHeader.length) {
		return false;
	}

	return actualHeader.every((val, i) => val === expectedHeader[i]);
}

function getHeaderMatcher({ headers: expectedHeaders }, Headers) {
	if (!expectedHeaders) {
		return () => true;
	}
	const expectation = headersToLowerCase(expectedHeaders);

	return ({ headers = {} }) => {
		if (headers instanceof Headers) {
			// node-fetch 1 Headers
			if (typeof headers.raw === 'function') {
				headers = Object.entries(headers.raw());
			}
			headers = [...headers].reduce((map, [key, val]) => {
				map[key] = val;
				return map;
			}, {});
		}

		const lowerCaseHeaders = headersToLowerCase(headers);

		return Object.keys(expectation).every(headerName => {
			return areHeadersEqual(
				lowerCaseHeaders[headerName],
				expectation[headerName]
			);
		});
	};
}

const getMethodMatcher = route => {
	return ({ method }) => {
		return (
			!route.method || route.method === (method ? method.toLowerCase() : 'get')
		);
	};
};

const getQueryStringMatcher = route => {
	if (!route.query) {
		return () => true;
	}
	const keys = Object.keys(route.query);
	return ({ url }) => {
		const query = querystring.parse(URL.parse(url).query);
		return keys.every(key => query[key] === route.query[key]);
	};
};

const getUrlMatcher = route => {
	// When the matcher is a function it should not be compared with the url
	// in the normal way
	if (typeof route.matcher === 'function') {
		return () => true;
	}

	if (route.matcher instanceof RegExp) {
		const urlRX = route.matcher;
		return ({ url }) => urlRX.test(url);
	}

	if (route.matcher === '*') {
		return () => true;
	}

	if (route.matcher.indexOf('^') === 0) {
		throw new Error(
			"Using '^' to denote the start of a url is deprecated. Use 'begin:' instead"
		);
	}

	for (const shorthand in stringMatchers) {
		if (route.matcher.indexOf(shorthand + ':') === 0) {
			const url = route.matcher.replace(new RegExp(`^${shorthand}:`), '');
			return stringMatchers[shorthand](url);
		}
	}

	// if none of the special syntaxes apply, it's just a simple string match
	const expectedUrl = route.matcher;
	return ({ url }) => {
		if (route.query && expectedUrl.indexOf('?')) {
			return url.indexOf(expectedUrl) === 0;
		}
		return url === expectedUrl;
	};
};

const sanitizeRoute = route => {
	route = Object.assign({}, route);

	if (typeof route.response === 'undefined') {
		throw new Error('Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error(
			'Each route must specify a string, regex or function to match calls to fetch'
		);
	}

	if (!route.name) {
		route.name = route.matcher.toString();
		route.__unnamed = true;
	}

	if (route.method) {
		route.method = route.method.toLowerCase();
	}

	return route;
};

const getFunctionMatcher = route => {
	if (typeof route.matcher === 'function') {
		const matcher = route.matcher;
		return (req, [url, options]) => matcher(url, options);
	} else {
		return () => true;
	}
};

const generateMatcher = (route, config) => {
	const matchers = [
		getQueryStringMatcher(route),
		getMethodMatcher(route),
		getHeaderMatcher(route, config.Headers),
		getUrlMatcher(route),
		getFunctionMatcher(route)
	];

	return (url, options) => {
		const req = normalizeRequest(url, options, config.Request);
		return matchers.every(matcher => matcher(req, [url, options]));
	};
};

const limitMatcher = route => {
	if (!route.repeat) {
		return;
	}

	const matcher = route.matcher;
	let timesLeft = route.repeat;
	route.matcher = (url, options) => {
		const match = timesLeft && matcher(url, options);
		if (match) {
			timesLeft--;
			return true;
		}
	};
	route.reset = () => (timesLeft = route.repeat);
};

module.exports = function(route) {
	route = sanitizeRoute(route);

	route.matcher = generateMatcher(route, this.config);

	limitMatcher(route);

	return route;
};
