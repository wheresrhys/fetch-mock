const glob = require('glob-to-regexp');
const URL = require('whatwg-url');
const pathToRegexp = require('path-to-regexp');
const querystring = require('querystring');
const {
	headers: headerUtils,
	getPath,
	normalizeUrl
} = require('./request-utils');

const stringMatchers = {
	begin: targetString => url => url.indexOf(targetString) === 0,
	end: targetString => url => url.substr(-targetString.length) === targetString,
	glob: targetString => {
		const urlRX = glob(targetString);
		return url => urlRX.test(url);
	},
	express: targetString => {
		const urlRX = pathToRegexp(targetString);
		return url => urlRX.test(getPath(url));
	},
	path: targetString => url => getPath(url) === targetString
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
		const query = querystring.parse(URL.parseURL(url).query);
		return keys.every(key => query[key] === expectedQuery[key]);
	};
};

const getParamsMatcher = ({ params: expectedParams, matcher }) => {
	if (!/express:/.test(matcher)) {
		throw new Error(
			'fetch-mock: matching on params is only possible when using an express: matcher'
		);
	}
	const expectedKeys = Object.keys(expectedParams);
	const keys = [];
	const re = pathToRegexp(matcher.replace(/^express:/, ''), keys);
	return url => {
		const vals = re.exec(url) || [];
		vals.shift();
		const params = keys.reduce(
			(map, { name }, i) =>
				vals[i] ? Object.assign(map, { [name]: vals[i] }) : map,
			{}
		);
		return expectedKeys.every(key => params[key] === expectedParams[key]);
	};
};

const getUrlMatcher = route => {
	const { matcher, query } = route;

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
	// but we have to be careful to normalize the url we check and the name
	// of the route to allow for e.g. http://it.at.there being indistinguishable
	// from http://it.at.there/ once we start generating Request/Url objects
	const expectedUrl = normalizeUrl(matcher);
	if (route.identifier === matcher) {
		route.identifier = expectedUrl;
	}

	return url => {
		if (query && expectedUrl.indexOf('?')) {
			return url.indexOf(expectedUrl) === 0;
		}
		return normalizeUrl(url) === expectedUrl;
	};
};

const sanitizeRoute = route => {
	route = Object.assign({}, route);

	if (typeof route.response === 'undefined') {
		throw new Error('fetch-mock: Each route must define a response');
	}

	if (!route.matcher) {
		throw new Error(
			'fetch-mock: Each route must specify a string, regex or function to match calls to fetch'
		);
	}

	if (route.method) {
		route.method = route.method.toLowerCase();
	}
	route.identifier = route.name || route.matcher;

	return route;
};

const generateMatcher = route => {
	const matchers = [
		route.query && getQueryStringMatcher(route),
		route.method && getMethodMatcher(route),
		route.headers && getHeaderMatcher(route),
		route.params && getParamsMatcher(route),
		getUrlMatcher(route)
	].filter(matcher => !!matcher);

	return (url, options = {}, request) => {
		return matchers.every(matcher => matcher(url, options, request));
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
