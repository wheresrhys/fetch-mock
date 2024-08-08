//@type-check
/** @typedef {import('./Route.js').RouteConfig} RouteConfig */
/** @typedef {import('./CallHistory.js').CallLog} CallLog */
import glob from 'globrex';
import * as regexparam from 'regexparam';
import { isSubsetOf } from 'is-subset-of';
import { dequal as isEqual } from 'dequal';
import { normalizeHeaders, getPath, normalizeUrl } from './RequestUtils.js';

/**
 * @typedef URLMatcherObject
 * @property {string} [begin]
 * @property {string} [end]
 * @property {string} [glob]
 * @property {string} [express]
 * @property {string} [path]
 * @property {RegExp} [regexp]
 */
export type RouteMatcherUrl = string | RegExp | URL | URLMatcherObject;
type UrlMatcherGenerator = (targetString: string) => RouteMatcherFunction;
export type RouteMatcherFunction = (callLog: CallLog) => boolean;
type MatcherGenerator = (route: RouteConfig) => RouteMatcherFunction;
export type RouteMatcher = RouteMatcherUrl | RouteMatcherFunction;

export type MatcherDefinition = {
	name: string;
	matcher: MatcherGenerator;
	usesBody?: boolean;
};

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
		const urlRX = /** @type {{regex: RegExp}} */ (glob(targetString));
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
const getMissingHeaderMatcher = ({
	missingHeaders: expectedMissingHeaders,
}) => {
	if (!expectedMissingHeaders) {
		return;
	}
	const expectation = expectedMissingHeaders.map((header) =>
		header.toLowerCase(),
	);
	return ({ options: { headers = {} } }) => {
		const lowerCaseHeaders = normalizeHeaders(headers);
		return expectation.every((headerName) => !(headerName in lowerCaseHeaders));
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
const getQueryParamsMatcher = ({ query: passedQuery }) => {
	if (!passedQuery) {
		return;
	}
	const expectedQuery = new URLSearchParams();
	for (const [key, value] of Object.entries(passedQuery)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				expectedQuery.append(
					key,
					typeof item === 'object' || typeof item === 'undefined'
						? ''
						: item.toString(),
				);
			}
		} else {
			expectedQuery.append(
				key,
				typeof value === 'object' || typeof value === 'undefined'
					? ''
					: value.toString(),
			);
		}
	}

	const keys = Array.from(expectedQuery.keys());
	return ({ queryParams }) => {
		return keys.every((key) => {
			const expectedValues = expectedQuery.getAll(key).sort();
			const actualValues = queryParams.getAll(key).sort();

			if (expectedValues.length !== actualValues.length) {
				return false;
			}

			if (Array.isArray(passedQuery[key])) {
				return expectedValues.every(
					(expected, index) => expected === actualValues[index],
				);
			}

			return isEqual(actualValues, expectedValues);
		});
	};
};
/**
 * @type {MatcherGenerator}
 */
const getExpressParamsMatcher = ({ params: expectedParams, url }) => {
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

	if (!expectedBody) {
		return;
	}

	return ({ options: { body, method = 'get' } }) => {
		if (['get', 'head', 'delete'].includes(method.toLowerCase())) {
			// GET requests don’t send a body so even if it exists in the options
			// we treat as no body because it would never actually make it to the server
			// in the application code
			return false;
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
				? isSubsetOf(expectedBody, sentBody)
				: isEqual(expectedBody, sentBody))
		);
	};
};

/**
 * @type {MatcherGenerator}
 */
const getFunctionMatcher = ({ matcherFunction }) => matcherFunction;

/**
 * @param {RegExp} regexp
 * @returns {RouteMatcherFunction}
 */
const getRegexpMatcher =
	(regexp) =>
	({ url }) =>
		regexp.test(url);

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
const getUrlMatcher = (route) => {
	const { url: matcherUrl, query } = route;

	if (matcherUrl === '*') {
		return () => true;
	}

	if (matcherUrl instanceof RegExp) {
		return getRegexpMatcher(matcherUrl);
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

	if (typeof matcherUrl === 'object') {
		const matchers = Object.entries(matcherUrl).map(([key, pattern]) => {
			if (key === 'regexp') {
				return getRegexpMatcher(pattern);
			} else if (key in stringMatchers) {
				return stringMatchers[key](pattern);
			} else {
				throw new Error(`unrecognised url matching pattern: ${key}`);
			}
		});

		return (route) => matchers.every((matcher) => matcher(route));
	}
};

/** @type {MatcherDefinition[]} */
export const builtInMatchers = [
	{ name: 'url', matcher: getUrlMatcher },
	{ name: 'query', matcher: getQueryParamsMatcher },
	{ name: 'method', matcher: getMethodMatcher },
	{ name: 'headers', matcher: getHeaderMatcher },
	{ name: 'missingHeaders', matcher: getMissingHeaderMatcher },
	{ name: 'params', matcher: getExpressParamsMatcher },
	{ name: 'body', matcher: getBodyMatcher, usesBody: true },
	{ name: 'matcherFunction', matcher: getFunctionMatcher },
];
