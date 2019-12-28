const glob = require('glob-to-regexp');
const pathToRegexp = require('path-to-regexp');
const querystring = require('querystring');
const {
	headers: headerUtils,
	getPath,
	getQuery,
	normalizeUrl
} = require('./request-utils');
const isEqual = require('lodash.isequal');

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

const getHeaderMatcher = ({ headers: expectedHeaders }) => {
	const expectation = headerUtils.toLowerCase(expectedHeaders);
	return (url, { headers = {} }) => {
		const lowerCaseHeaders = headerUtils.toLowerCase(
			headerUtils.normalize(headers)
		);

		return Object.keys(expectation).every(headerName =>
			headerUtils.equal(lowerCaseHeaders[headerName], expectation[headerName])
		);
	};
};

const getMethodMatcher = ({ method: expectedMethod }) => {
	return (url, { method }) =>
		expectedMethod === (method ? method.toLowerCase() : 'get');
};

const getQueryStringMatcher = ({ query: expectedQuery }) => {
	const keys = Object.keys(expectedQuery);
	return url => {
		const query = querystring.parse(getQuery(url));
		return keys.every(key => query[key] === expectedQuery[key]);
	};
};

const getParamsMatcher = ({ params: expectedParams, url: matcheUrl }) => {
	if (!/express:/.test(matcheUrl)) {
		throw new Error(
			'fetch-mock: matching on params is only possible when using an express: matcher'
		);
	}
	const expectedKeys = Object.keys(expectedParams);
	const keys = [];
	const re = pathToRegexp(matcheUrl.replace(/^express:/, ''), keys);
	return url => {
		const vals = re.exec(getPath(url)) || [];
		vals.shift();
		const params = keys.reduce(
			(map, { name }, i) =>
				vals[i] ? Object.assign(map, { [name]: vals[i] }) : map,
			{}
		);
		return expectedKeys.every(key => params[key] === expectedParams[key]);
	};
};

const getBodyMatcher = ({ body: expectedBody }) => {
	return (url, { body, method = 'get' }) => {
		if (method.toLowerCase() === 'get') {
			// GET requests don’t send a body so the body matcher should be ignored for them
			return true;
		}

		let sentBody;

		try {
			sentBody = JSON.parse(body);
		} catch (_) {}

		return sentBody && isEqual(sentBody, expectedBody);
	};
};

const getFullUrlMatcher = (route, matcherUrl, query) => {
	// if none of the special syntaxes apply, it's just a simple string match
	// but we have to be careful to normalize the url we check and the name
	// of the route to allow for e.g. http://it.at.there being indistinguishable
	// from http://it.at.there/ once we start generating Request/Url objects
	const expectedUrl = normalizeUrl(matcherUrl);
	if (route.identifier === matcherUrl) {
		route.identifier = expectedUrl;
	}

	return matcherUrl => {
		if (query && expectedUrl.indexOf('?')) {
			return matcherUrl.indexOf(expectedUrl) === 0;
		}
		return normalizeUrl(matcherUrl) === expectedUrl;
	};
};

const getFunctionMatcher = ({ functionMatcher }) => functionMatcher;

const getUrlMatcher = route => {
	const { url: matcherUrl, query } = route;

	if (matcherUrl === '*') {
		return () => true;
	}

	if (matcherUrl instanceof RegExp) {
		return url => matcherUrl.test(url);
	}

	if (matcherUrl.href) {
		return getFullUrlMatcher(route, matcherUrl.href, query);
	}

	for (const shorthand in stringMatchers) {
		if (matcherUrl.indexOf(shorthand + ':') === 0) {
			const urlFragment = matcherUrl.replace(new RegExp(`^${shorthand}:`), '');
			return stringMatchers[shorthand](urlFragment);
		}
	}

	return getFullUrlMatcher(route, matcherUrl, query);
};

module.exports = route => {
	const matchers = [
		route.query && getQueryStringMatcher(route),
		route.method && getMethodMatcher(route),
		route.headers && getHeaderMatcher(route),
		route.params && getParamsMatcher(route),
		route.body && getBodyMatcher(route),
		route.functionMatcher && getFunctionMatcher(route),
		route.url && getUrlMatcher(route)
	].filter(matcher => !!matcher);

	return (url, options = {}, request) =>
		matchers.every(matcher => matcher(url, options, request));
};
