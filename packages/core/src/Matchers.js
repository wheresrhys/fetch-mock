//@type-check
/** @typedef {import('./Route').RouteOptions} RouteOptions */
/** @typedef {import('./RequestUtils').NormalizedRequestOptions} NormalizedRequestOptions */
import glob from 'glob-to-regexp';
import pathToRegexp from 'path-to-regexp';
import querystring from 'querystring';
import isSubset from 'is-subset';
import isEqual from 'lodash.isequal';
import {
	headers as headerUtils,
	getPath,
	getQuery,
	normalizeUrl,
} from './RequestUtils.js';
import Route from './Route.js';

/** @typedef {string | RegExp | URL} RouteMatcherUrl */
/** @typedef {function(string): boolean} UrlMatcher */
/** @typedef {function(string): UrlMatcher} UrlMatcherGenerator */
/** @typedef {function(string, NormalizedRequestOptions, Request): boolean} RouteMatcherFunction */
/** @typedef {function(RouteOptions): RouteMatcherFunction} MatcherGenerator */
/** @typedef {RouteMatcherUrl | RouteMatcherFunction} RouteMatcher */

/**
 * @typedef MatcherDefinition
 * @property {string} name
 * @property {MatcherGenerator} matcher
 * @property  {boolean} [usesBody]
 */

/**
 * @type {Object.<string, UrlMatcherGenerator>}
 */
const stringMatchers = {
	begin: (targetString) => (url) => url.indexOf(targetString) === 0,
	end: (targetString) => (url) =>
		url.substr(-targetString.length) === targetString,

	glob: (targetString) => {
		const urlRX = glob(targetString);
		return (url) => urlRX.test(url);
	},
	express: (targetString) => {
		const urlRX = pathToRegexp(targetString);
		return (url) => urlRX.test(getPath(url));
	},
	path: (targetString) => (url) => getPath(url) === targetString,
};
/**
 * @type {MatcherGenerator}
 */
const getHeaderMatcher = ({ headers: expectedHeaders }) => {
	if (!expectedHeaders) {
		return;
	}
	const expectation = headerUtils.normalize2(expectedHeaders);
	return (url, { headers = {} }) => {
		const lowerCaseHeaders = headerUtils.toLowerCase(
			headerUtils.normalize(headers),
		);
		return Object.keys(expectation).every((headerName) =>
			headerUtils.equal(lowerCaseHeaders[headerName], expectation[headerName]),
		);
	};
};
/**
 * @type {MatcherGenerator}
 */
const getMethodMatcher = ({ method: expectedMethod }) => {
	if (!expectedMethod) {
		return;
	}
	return (url, { method }) => {
		const actualMethod = method ? method.toLowerCase() : 'get';
		return expectedMethod === actualMethod;
	};
};
/**
 * @type {MatcherGenerator}
 */
const getQueryStringMatcher = ({ query: passedQuery }) => {
	if (!passedQuery) {
		return;
	}
	const expectedQuery = querystring.parse(querystring.stringify(passedQuery));
	const keys = Object.keys(expectedQuery);
	return (url) => {
		const query = querystring.parse(getQuery(url));
		return keys.every((key) => {
			if (Array.isArray(query[key])) {
				if (!Array.isArray(expectedQuery[key])) {
					return false;
				}
				return isEqual(query[key].sort(), expectedQuery[key].sort());
			}
			return query[key] === expectedQuery[key];
		});
	};
};
/**
 * @type {MatcherGenerator}
 */
const getParamsMatcher = ({ params: expectedParams, url: matcherUrl }) => {
	if (!expectedParams) {
		return;
	}
	if (!/express:/.test(matcherUrl)) {
		throw new Error(
			'fetch-mock: matching on params is only possible when using an express: matcher',
		);
	}
	const expectedKeys = Object.keys(expectedParams);
	const keys = [];
	const re = pathToRegexp(matcherUrl.replace(/^express:/, ''), keys);
	return (url) => {
		const vals = re.exec(getPath(url)) || [];
		vals.shift();
		const params = keys.reduce(
			(map, { name }, i) =>
				vals[i] ? Object.assign(map, { [name]: vals[i] }) : map,
			{},
		);
		return expectedKeys.every((key) => params[key] === expectedParams[key]);
	};
};
/**
 * @type {MatcherGenerator}
 */
const getBodyMatcher = (route) => {
	const { body: expectedBody } = route;

	return (url, { body, method = 'get' }) => {
		if (method.toLowerCase() === 'get') {
			// GET requests don’t send a body so the body matcher should be ignored for them
			return true;
		}

		let sentBody;

		try {
			sentBody = JSON.parse(body);
		} catch (err) {}

		return (
			sentBody &&
			(route.matchPartialBody
				? isSubset(sentBody, expectedBody)
				: isEqual(sentBody, expectedBody))
		);
	};
};
/**
 *
 * @param {RouteOptions} route
 * @param {string} matcherUrl
 * @param {Object.<string,string>} query
 * @returns {RouteMatcherFunction}
 */
const getFullUrlMatcher = (route, matcherUrl, query) => {
	// if none of the special syntaxes apply, it's just a simple string match
	// but we have to be careful to normalize the url we check and the name
	// of the route to allow for e.g. http://it.at.there being indistinguishable
	// from http://it.at.there/ once we start generating Request/Url objects
	const expectedUrl = normalizeUrl(matcherUrl);
	if (route.url === matcherUrl) {
		route.url = expectedUrl;
	}

	return (matcherUrl) => {
		if (query && expectedUrl.indexOf('?')) {
			return matcherUrl.indexOf(expectedUrl) === 0;
		}
		return normalizeUrl(matcherUrl) === expectedUrl;
	};
};

/**
 * @type {MatcherGenerator}
 */
const getFunctionMatcher = ({ functionMatcher }) => functionMatcher;
/**
 * @type {MatcherGenerator}
 */
const getUrlMatcher = (route) => {
	const { url: matcherUrl, query } = route;

	if (matcherUrl === '*') {
		return () => true;
	}

	if (matcherUrl instanceof RegExp) {
		return (url) => matcherUrl.test(url);
	}

	if (matcherUrl.href) {
		return getFullUrlMatcher(route, matcherUrl.href, query);
	}

	for (const shorthand in stringMatchers) {
		if (matcherUrl.indexOf(`${shorthand}:`) === 0) {
			const urlFragment = matcherUrl.replace(new RegExp(`^${shorthand}:`), '');
			return stringMatchers[shorthand](urlFragment);
		}
	}

	return getFullUrlMatcher(route, matcherUrl, query);
};

/** @type {MatcherDefinition[]} */
export default [
	{ name: 'query', matcher: getQueryStringMatcher },
	{ name: 'method', matcher: getMethodMatcher },
	{ name: 'headers', matcher: getHeaderMatcher },
	{ name: 'params', matcher: getParamsMatcher },
	{ name: 'body', matcher: getBodyMatcher, usesBody: true },
	{ name: 'functionMatcher', matcher: getFunctionMatcher },
	{ name: 'url', matcher: getUrlMatcher },
];
