import glob from 'glob-to-regexp';
import * as regexparam from 'regexparam';
import isSubset from 'is-subset';
import { dequal as isEqual } from 'dequal';
import {
	headers as headerUtils,
	getPath,
	getQuery,
	normalizeUrl,
} from '../lib/request-utils.js';

const debuggableUrlFunc = (func) => (url) => {
	return func(url);
};

const stringMatchers = {
	begin: (targetString) =>
		debuggableUrlFunc((url) => url.indexOf(targetString) === 0),
	end: (targetString) =>
		debuggableUrlFunc(
			(url) => url.substr(-targetString.length) === targetString,
		),
	glob: (targetString) => {
		const urlRX = glob(targetString);
		return debuggableUrlFunc((url) => urlRX.test(url));
	},
	express: (targetString) => {
		const urlRX = regexparam.parse(targetString);
		return debuggableUrlFunc((url) => urlRX.pattern.test(getPath(url)));
	},
	path: (targetString) =>
		debuggableUrlFunc((url) => getPath(url) === targetString),
};

const getHeaderMatcher = ({ headers: expectedHeaders }) => {
	if (!expectedHeaders) {
		return;
	}
	const expectation = headerUtils.toLowerCase(expectedHeaders);
	return (url, { headers = {} }) => {
		const lowerCaseHeaders = headerUtils.toLowerCase(
			headerUtils.normalize(headers),
		);
		return Object.keys(expectation).every((headerName) =>
			headerUtils.equal(lowerCaseHeaders[headerName], expectation[headerName]),
		);
	};
};

const getMethodMatcher = ({ method: expectedMethod }) => {
	if (!expectedMethod) {
		return;
	}
	return (url, { method }) => {
		const actualMethod = method ? method.toLowerCase() : 'get';
		return expectedMethod === actualMethod;
	};
};

const getQueryStringMatcher = ({ query: passedQuery }) => {
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
	return (url) => {
		const queryString = getQuery(url);
		const query = new URLSearchParams(queryString);

		return keys.every((key) => {
			const expectedValues = expectedQuery.getAll(key).sort();
			const actualValues = query.getAll(key).sort();

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
	const re = regexparam.parse(matcherUrl.replace(/^express:/, ''));
	return (url) => {
		const vals = re.pattern.exec(getPath(url)) || [];
		vals.shift();
		const params = re.keys.reduce(
			(map, paramName, i) =>
				vals[i] ? Object.assign(map, { [paramName]: vals[i] }) : map,
			{},
		);
		return expectedKeys.every((key) => params[key] === expectedParams[key]);
	};
};

const getBodyMatcher = (route, fetchMock) => {
	const matchPartialBody = fetchMock.getOption('matchPartialBody', route);
	const { body: expectedBody } = route;

	return (url, { body, method = 'get' }) => {
		if (method.toLowerCase() === 'get') {
			// GET requests don’t send a body so the body matcher should be ignored for them
			return true;
		}

		let sentBody;

		try {
			sentBody = JSON.parse(body);
		} catch {} // eslint-disable-line no-empty

		return (
			sentBody &&
			(matchPartialBody
				? isSubset(sentBody, expectedBody)
				: isEqual(sentBody, expectedBody))
		);
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

	return (matcherUrl) => {
		if (query && expectedUrl.indexOf('?')) {
			return matcherUrl.indexOf(expectedUrl) === 0;
		}
		return normalizeUrl(matcherUrl) === expectedUrl;
	};
};

const getFunctionMatcher = ({ functionMatcher }) => {
	return (...args) => {
		return functionMatcher(...args);
	};
};

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

export default [
	{ name: 'query', matcher: getQueryStringMatcher },
	{ name: 'method', matcher: getMethodMatcher },
	{ name: 'headers', matcher: getHeaderMatcher },
	{ name: 'params', matcher: getParamsMatcher },
	{ name: 'body', matcher: getBodyMatcher, usesBody: true },
	{ name: 'functionMatcher', matcher: getFunctionMatcher },
	{ name: 'url', matcher: getUrlMatcher },
];
