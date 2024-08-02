import glob from 'globrex';
import * as regexparam from 'regexparam';
import { isSubsetOf } from 'is-subset-of';
import { dequal as isEqual } from 'dequal';

import { RouteConfig } from './Route.js';
import { CallLog } from './CallHistory.ts';
import { normalizeHeaders, getPath, normalizeUrl } from './RequestUtils.ts';

interface URLMatcherObject {
  begin?: string;
  end?: string;
  glob?: string;
  express?: string;
  path?: string;
  regexp?: RegExp;
}




export type RouteMatcherUrl = string | RegExp | URL | URLMatcherObject;
export type RouteMatcherFunction = (callLog: CallLog) => boolean;
export type RouteMatcher = RouteMatcherUrl | RouteMatcherFunction;

type MatcherGenerator = (route: RouteConfig) => RouteMatcherFunction;
export interface MatcherDefinition {
  name: string;
  matcher: MatcherGenerator;
  usesBody?: boolean;
}

export function isUrlMatcher (matcher: RouteMatcher | RouteConfig): matcher is RouteMatcherUrl {
  return matcher instanceof RegExp ||
  typeof matcher === 'string' ||
  (typeof matcher === 'object' && 'href' in matcher);
}

export function isFunctionMatcher (matcher: RouteMatcher | RouteConfig): matcher is RouteMatcherFunction {
  return typeof matcher === 'function';
}

type UrlMatcherGenerator = (targetString: string) => RouteMatcherFunction;

const stringMatchers: { [key: string]: UrlMatcherGenerator } = {
  begin: (targetString) => ({ url }) => url.indexOf(targetString) === 0,
  end: (targetString) => ({ url }) => url.substr(-targetString.length) === targetString,
  glob: (targetString) => {
    const urlRX = glob(targetString) as { regex: RegExp };
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
      callLog.expressParams = urlRX.keys.reduce(
        (map, paramName, i) =>
          vals[i] ? Object.assign(map, { [paramName]: vals[i] }) : map,
        {},
      );
      return true;
    };
  },
  path: (targetString) => ({ url }) => getPath(url) === targetString,
};

const getHeaderMatcher: MatcherGenerator = ({ headers: expectedHeaders }) => {
  if (!expectedHeaders) {
    return;
  }
  const expectation = normalizeHeaders(expectedHeaders);
  return ({ options: { headers = {} } }) => {
    const lowerCaseHeaders = normalizeHeaders(headers);
    return Object.keys(expectation).every(
      (headerName) => lowerCaseHeaders[headerName] === expectation[headerName],
    );
  };
};

const getMethodMatcher: MatcherGenerator = ({ method: expectedMethod }) => {
  if (!expectedMethod) {
    return;
  }
  return ({ options: { method } = {} }) => {
    const actualMethod = method ? method.toLowerCase() : 'get';
    return expectedMethod === actualMethod;
  };
};

const getQueryParamsMatcher: MatcherGenerator = ({ query: passedQuery }) => {
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

const getExpressParamsMatcher: MatcherGenerator = ({ params: expectedParams, url }) => {
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

const getBodyMatcher: MatcherGenerator = (route) => {
  const { body: expectedBody } = route;

  if (!expectedBody) {
    return;
  }

  return ({ options: { body, method = 'get' } }) => {
    if (['get', 'head', 'delete'].includes(method.toLowerCase())) {
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

const getFunctionMatcher: MatcherGenerator = ({ matcherFunction }) => matcherFunction;

const getRegexpMatcher = (regexp: RegExp): RouteMatcherFunction => ({ url }) => regexp.test(url);

const getFullUrlMatcher = (route: RouteConfig, matcherUrl: string, query: { [key: string]: string }): RouteMatcherFunction => {
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

const getUrlMatcher: MatcherGenerator = (route) => {
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

export const builtInMatchers: MatcherDefinition[] = [
  { name: 'url', matcher: getUrlMatcher },
  { name: 'query', matcher: getQueryParamsMatcher },
  { name: 'method', matcher: getMethodMatcher },
  { name: 'headers', matcher: getHeaderMatcher },
  { name: 'params', matcher: getExpressParamsMatcher },
  { name: 'body', matcher: getBodyMatcher, usesBody: true },
  { name: 'matcherFunction', matcher: getFunctionMatcher },
];
