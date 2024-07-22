//@type-check
/** @typedef {import('./Route').RouteConfig} RouteConfig */
/** @typedef {import('./CallHistory').CallLog} CallLog */
import glob from 'globrex';
import * as regexparam from 'regexparam';
import querystring from 'querystring';
import isSubset from 'is-subset';
import { dequal as isEqual } from 'dequal';
import {
	normalizeHeaders,
	getPath,
	getQuery,
	normalizeUrl,
} from './RequestUtils.js';

/**
 * @param {RouteMatcher | RouteConfig} matcher
 * @returns {matcher is RouteMatcherUrl}
 */
export const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

/**
 *
 * @param {RouteMatcher| RouteConfig} matcher
 * @returns {matcher is RouteMatcherFunction}
 */
export const isFunctionMatcher = (matcher) => typeof matcher === 'function';

/** @typedef {string | RegExp | URL} RouteMatcherUrl */
/** @typedef {function(string): RouteMatcherFunction} UrlMatcherGenerator */
/** @typedef {function(CallLog): boolean} RouteMatcherFunction */
/** @typedef {function(RouteConfig): RouteMatcherFunction} MatcherGenerator */
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
	begin:
		(targetString) =>
		({ url }) =>
			url.indexOf(targetString) === 0,
	end:
		(targetString) =>
		({ url }) =>
			url.substr(-targetString.length) === targetString,

	glob: (targetString) => {
		
		const urlRX = /** @type {{regex: RegExp}} */(glob(targetString));
		return ({ url }) => urlRX.regex.test(url);
	},
	express: (targetString) => {
		const urlRX = regexparam.parse(targetString);
		return (callLog) => {
			const vals = urlRX.pattern.exec(getPath(callLog.url));
			if (!vals) {
				callLog.expressParams = {};
				return false;
			}
			vals.shift();
			/** @type {Object.<string,string>} */
			callLog.expressParams = urlRX.keys.reduce(
				(map, paramName, i) =>
					vals[i] ? Object.assign(map, { [paramName]: vals[i] }) : map,
				{},
			);
			return true;
		};
	},
	path:
		(targetString) =>
		({ url }) =>
			getPath(url) === targetString,
};
/**
 * @type {MatcherGenerator}
 */
const getHeaderMatcher = ({ headers: expectedHeaders }) => {
	if (!expectedHeaders) {
		return;
	}
	const expectation = normalizeHeaders(expectedHeaders);
	return ({ options: { headers = {} } }) => {
		// TODO do something to handle multi value headers
		const lowerCaseHeaders = normalizeHeaders(headers);
		return Object.keys(expectation).every(
			(headerName) => lowerCaseHeaders[headerName] === expectation[headerName],
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
	return ({ options: { method } = {} }) => {
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
	return ({ url }) => {
		const query = querystring.parse(getQuery(url));
		return keys.every((key) => {
			if (Array.isArray(query[key])) {
				if (!Array.isArray(expectedQuery[key])) {
					return false;
				}
				return isEqual(
					/** @type {string[]}*/ (query[key]).sort(),
					/** @type {string[]}*/ (expectedQuery[key]).sort(),
				);
			}
			return query[key] === expectedQuery[key];
		});
	};
};
/**
 * @type {MatcherGenerator}
 */
const getParamsMatcher = ({ params: expectedParams, url }) => {
	if (!expectedParams) {
		return;
	}
	if (!(typeof url === 'string' && /express:/.test(url))) {
		throw new Error(
			'fetch-mock: matching on params is only possible when using an express: matcher',
		);
	}
	const expectedKeys = Object.keys(expectedParams);
	return ({ expressParams = {} }) => {
		return expectedKeys.every(
			(key) => expressParams[key] === expectedParams[key],
		);
	};
};
/**
 * @type {MatcherGenerator}
 */
const getBodyMatcher = (route) => {
	const { body: expectedBody } = route;

	return ({ options: { body, method = 'get' } }) => {
		if (method.toLowerCase() === 'get') {
			// GET requests don’t send a body so the body matcher should be ignored for them
			return true;
		}

		let sentBody;

		try {
			if (typeof body === 'string') {
				sentBody = JSON.parse(body);
			}
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
 * @param {RouteConfig} route
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

	return ({ url }) => {
		if (query && expectedUrl.indexOf('?')) {
			return getPath(url) === getPath(expectedUrl);
		}
		return normalizeUrl(url) === expectedUrl;
	};
};

/**
 * @type {MatcherGenerator}
 */
const getFunctionMatcher = ({ matcherFunction }) => matcherFunction;
/**
 * @type {MatcherGenerator}
 */
const getUrlMatcher = (route) => {
	const { url: matcherUrl, query } = route;

	if (matcherUrl === '*') {
		return () => true;
	}

	if (matcherUrl instanceof RegExp) {
		return ({ url }) => matcherUrl.test(url);
	}
	if (matcherUrl instanceof URL) {
		if (matcherUrl.href) {
			return getFullUrlMatcher(route, matcherUrl.href, query);
		}
	}
	if (typeof matcherUrl === 'string') {
		for (const shorthand in stringMatchers) {
			if (matcherUrl.indexOf(`${shorthand}:`) === 0) {
				const urlFragment = matcherUrl.replace(
					new RegExp(`^${shorthand}:`),
					'',
				);
				return stringMatchers[shorthand](urlFragment);
			}
		}
		return getFullUrlMatcher(route, matcherUrl, query);
	}
};

/** @type {MatcherDefinition[]} */
export const builtInMatchers = [
	{ name: 'url', matcher: getUrlMatcher },
	{ name: 'query', matcher: getQueryStringMatcher },
	{ name: 'method', matcher: getMethodMatcher },
	{ name: 'headers', matcher: getHeaderMatcher },
	{ name: 'params', matcher: getParamsMatcher },
	{ name: 'body', matcher: getBodyMatcher, usesBody: true },
	{ name: 'matcherFunction', matcher: getFunctionMatcher },
];
