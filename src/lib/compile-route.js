const glob = require('glob-to-regexp');
const express = require('path-to-regexp');
const URL = require('url');
const querystring = require('querystring');
const headerUtils = require('./header-utils');

const stringMatchers = {
	begin: targetString => {
		return url => url.indexOf(targetString) === 0;
	},
	end: targetString => {
		return url => url.substr(-targetString.length) === targetString;
	},
	glob: targetString => {
		const urlRX = glob(targetString);
		return url => urlRX.test(url);
	},
	express: targetString => {
		const urlRX = express(targetString);
		return url => urlRX.test(url);
	}
};

function getHeaderMatcher({ headers: expectedHeaders }) {
	const expectation = headerUtils.toLowerCase(expectedHeaders);
	return (url, { headers = {} }) => {
		const lowerCaseHeaders = headerUtils.toLowerCase(
			headerUtils.normalize(headers)
		);

		return Object.keys(expectation).every(headerName =>
			headerUtils.equal(lowerCaseHeaders[headerName], expectation[headerName])
		);
	};
}

const getMethodMatcher = ({ method: expectedMethod }) => {
	return (url, { method }) =>
		expectedMethod === (method ? method.toLowerCase() : 'get');
};

const getQueryStringMatcher = ({ query: expectedQuery }) => {
	const keys = Object.keys(expectedQuery);
	return url => {
		const query = querystring.parse(URL.parse(url).query);
		return keys.every(key => query[key] === expectedQuery[key]);
	};
};

const getUrlMatcher = ({ matcher, query }) => {
	if (typeof matcher === 'function') {
		return matcher;
	}

	if (matcher instanceof RegExp) {
		return url => matcher.test(url);
	}

	if (matcher === '*') {
		return () => true;
	}

	for (const shorthand in stringMatchers) {
		if (matcher.indexOf(shorthand + ':') === 0) {
			const url = matcher.replace(new RegExp(`^${shorthand}:`), '');
			return stringMatchers[shorthand](url);
		}
	}

	// if none of the special syntaxes apply, it's just a simple string match
	const expectedUrl = matcher;

	return url => {
		if (query && expectedUrl.indexOf('?')) {
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

const generateMatcher = route => {
	const matchers = [
		route.query && getQueryStringMatcher(route),
		route.method && getMethodMatcher(route),
		route.headers && getHeaderMatcher(route),
		getUrlMatcher(route)
	].filter(matcher => !!matcher);

	return (url, options = {}) => {
		return matchers.every(matcher => matcher(url, options));
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

	route.matcher = generateMatcher(route);

	limitMatcher(route);

	return route;
};
