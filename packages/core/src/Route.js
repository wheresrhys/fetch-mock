//@type-check
import { builtInMatchers, isUrlMatcher, isFunctionMatcher } from './Matchers';
import statusTextMap from './StatusTextMap';

/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./Matchers').RouteMatcherFunction} RouteMatcherFunction */
/** @typedef {import('./Matchers').RouteMatcherUrl} RouteMatcherUrl */
/** @typedef {import('./Matchers').MatcherDefinition} MatcherDefinition */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */

/**
 * @typedef RouteResponseConfig {
 * @property {string | {}} [body]
 * @property {number} [status]
 * @property {{ [key: string]: string }} [headers]
 * @property {Error} [throws]
 * @property {string} [redirectUrl]
 * @property {ResponseInit} [options]
 */

/** @typedef {RouteResponseConfig | Object }  RouteResponseObjectData */
/** @typedef {Response | number| string | RouteResponseObjectData }  RouteResponseData */
/** @typedef {Promise<RouteResponseData>}  RouteResponsePromise */
/** @typedef {function(string, RequestInit, Request=): (RouteResponseData|RouteResponsePromise)} RouteResponseFunction */
/** @typedef {RouteResponseData | RouteResponsePromise | RouteResponseFunction} RouteResponse*/

/** @typedef {string} RouteName */

/**
 * @typedef UserRouteConfig
 * @property {RouteName} [name]
 * @property {string} [method]
 * @property {{ [key: string]: string | number  }} [headers]
 * @property {{ [key: string]: string }} [query]
 * @property {{ [key: string]: string }} [params]
 * @property {object} [body]
 * @property {RouteMatcherFunction} [functionMatcher]
 * @property {RouteMatcher} [matcher]
 * @property {RouteMatcherUrl} [url]
 * @property {RouteResponse | RouteResponseFunction} [response]
 * @property {number} [repeat]
 * @property {number} [delay]
 * @property {boolean} [sendAsJson] - TODO this is global
 * @property {boolean} [includeContentLength] - TODO this is global
 * @property {boolean} [matchPartialBody] - TODO this is global
 * @property {boolean} [sticky]
 * @property {boolean} [usesBody] - TODO this shoudl not be in user config
 * @property {boolean} [isFallback]
 */

/** @typedef {UserRouteConfig & FetchMockConfig} RouteConfig*/

/**
 *
 * @param {number} [status]
 * @returns {number}
 */
function sanitizeStatus(status) {
	if (!status) {
		return 200;
	}

	if (
		//TODO wtf is this???
		(typeof status === 'number' &&
			parseInt(status, 10) !== status &&
			status >= 200) ||
		status < 600
	) {
		return status;
	}

	throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
}

/**
 * @class Route
 */
class Route {
	/**
	 * @param {RouteConfig} config
	 */
	constructor(config) {
		this.config = config;
		this.#sanitize();
		this.#validate();
		this.#generateMatcher();
		this.#limit();
		this.#delayResponse();
	}

	/** @type {RouteConfig} */
	config = {};
	/** @type {RouteMatcherFunction=} */
	matcher = null;

	/**
	 * @returns {void}
	 */
	// @ts-ignore
	#validate() {
		if (!('response' in this.config)) {
			throw new Error('fetch-mock: Each route must define a response');
		}
		if (!Route.registeredMatchers.some(({ name }) => name in this.config)) {
			throw new Error(
				"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'",
			);
		}
	}
	/**
	 * @returns {void}
	 */
	// @ts-ignore
	#sanitize() {
		if (this.config.method) {
			this.config.method = this.config.method.toLowerCase();
		}
		if (isUrlMatcher(this.config.matcher)) {
			this.config.url = this.config.matcher;
			delete this.config.matcher;
		}
		if (isFunctionMatcher(this.config.matcher)) {
			this.config.functionMatcher = this.config.matcher;
		}
	}
	/**
	 * @returns {void}
	 */
	// @ts-ignore
	#generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.filter(({ name }) => name in this.config)
			.map(({  matcher, usesBody }) => ({ matcher: matcher(this.config), usesBody }));
		this.config.usesBody = activeMatchers.some(({ usesBody }) => usesBody);
		/** @type {RouteMatcherFunction} */
		this.matcher = (url, options = {}, request) =>
			activeMatchers.every(({ matcher }) => matcher(url, options, request));
	}
	/**
	 * @returns {void}
	 */
	// @ts-ignore
	#limit() {
		if (!this.config.repeat) {
			return;
		}
		const originalMatcher = this.matcher;
		let timesLeft = this.config.repeat;
		this.matcher = (url, options, request) => {
			const match = timesLeft && originalMatcher(url, options, request);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => {
			timesLeft = this.config.repeat;
		};
	}
	/**
	 * @returns {void}
	 */
	// @ts-ignore
	#delayResponse() {
		if (this.config.delay) {
			const { response } = this.config;
			this.config.response = () => {
				return new Promise((res) =>
					setTimeout(() => res(response), this.config.delay),
				);
			};
		}
	}

	/**
	 *
	 * @param {RouteResponseConfig} responseInput
	 * @returns {{response: Response, responseOptions: ResponseInit}}
	 */
	constructResponse(responseInput) {
		const responseOptions = this.constructResponseOptions(responseInput);
		const body = this.constructResponseBody(responseInput, responseOptions);

		return {
			response: new this.config.Response(body, responseOptions),
			responseOptions,
		};
	}
	/**
	 *
	 * @param {RouteResponseConfig} responseInput
	 * @returns {ResponseInit}
	 */
	constructResponseOptions(responseInput) {
		const options = responseInput.options || {};
		options.status = sanitizeStatus(responseInput.status);
		options.statusText = statusTextMap[options.status];

		// Set up response headers. The empty object is to cope with
		// new Headers(undefined) throwing in Chrome
		// https://code.google.com/p/chromium/issues/detail?id=335871
		options.headers = new this.config.Headers(responseInput.headers || {});
		return options;
	}
	/**
	 *
	 * @param {RouteResponseConfig} responseInput
	 * @param {ResponseInit} responseOptions
	 * @returns
	 */
	constructResponseBody(responseInput, responseOptions) {
		// start to construct the body
		let body = responseInput.body;
		// convert to json if we need to
		if (
			this.config.sendAsJson &&
			responseInput.body != null && //eslint-disable-line
			typeof body === 'object'
		) {
			body = JSON.stringify(body);
			if (
				!(/** @type {Headers} */ (responseOptions.headers).has('Content-Type'))
			) {
				/** @type {Headers} */ (responseOptions.headers).set(
					'Content-Type',
					'application/json',
				);
			}
		}
		// add a Content-Length header if we need to
		if (
			this.config.includeContentLength &&
			typeof body === 'string' &&
			!(/** @type {Headers} */ (responseOptions.headers).has('Content-Length'))
		) {
			/** @type {Headers} */ (responseOptions.headers).set(
				'Content-Length',
				body.length.toString(),
			);
		}
		return body;
	}

	/**
	 * @param {MatcherDefinition} matcher
	 */
	static defineMatcher(matcher) {
		Route.registeredMatchers.push(matcher);
	}
	/** @type {MatcherDefinition[]} */
	static registeredMatchers = [];
}

builtInMatchers.forEach(Route.defineMatcher);

export default Route;
