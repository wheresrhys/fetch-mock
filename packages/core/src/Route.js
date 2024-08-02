//@type-check
import { builtInMatchers } from './Matchers.ts';
import statusTextMap from './StatusTextMap.js';

/** @typedef {import('./Matchers.ts').RouteMatcher} RouteMatcher */
/** @typedef {import('./CallHistory.js').CallLog} CallLog */
/** @typedef {import('./Matchers.ts').RouteMatcherFunction} RouteMatcherFunction */
/** @typedef {import('./Matchers.ts').RouteMatcherUrl} RouteMatcherUrl */
/** @typedef {import('./Matchers.ts').MatcherDefinition} MatcherDefinition */
/** @typedef {import('./FetchMock.js').FetchMockGlobalConfig} FetchMockGlobalConfig */
/** @typedef {import('./FetchMock.js').FetchImplementations} FetchImplementations */

/**
 * @typedef UserRouteConfig
 * @property {RouteName} [name]
 * @property {string} [method]
 * @property {{ [key: string]: string | number  }} [headers]
 * @property {{ [key: string]: string }} [query]
 * @property {{ [key: string]: string }} [params]
 * @property {object} [body]
 * @property {RouteMatcherFunction} [matcherFunction]
 * @property {RouteMatcherUrl} [url]
 * @property {RouteResponse | RouteResponseFunction} [response]
 * @property {number} [repeat]
 * @property {number} [delay]
 * @property {boolean} [sticky]
 */

/**
 * @typedef InternalRouteConfig
 * @property {boolean} [usesBody]
 * @property {boolean} [isFallback]
 */

/** @typedef {UserRouteConfig & FetchMockGlobalConfig} ExtendedUserRouteConfig */
/** @typedef {ExtendedUserRouteConfig & FetchImplementations & InternalRouteConfig} RouteConfig */

/**
 * @typedef RouteResponseConfig {
 * @property {string | {}} [body]
 * @property {number} [status]
 * @property {{ [key: string]: string }} [headers]
 * @property {Error} [throws]
 * @property {string} [redirectUrl]
 * @property {ResponseInit} [options]
 */

/**
 * @typedef ResponseInitUsingHeaders
 * @property {number} status
 * @property {string} statusText
 * @property {Headers} headers
 */

/** @typedef {RouteResponseConfig | object}  RouteResponseObjectData */
/** @typedef {Response | number| string | RouteResponseObjectData }  RouteResponseData */
/** @typedef {Promise<RouteResponseData>}  RouteResponsePromise */
/** @typedef {function(CallLog): (RouteResponseData|RouteResponsePromise)} RouteResponseFunction */
/** @typedef {RouteResponseData | RouteResponsePromise | RouteResponseFunction} RouteResponse*/

/** @typedef {string} RouteName */

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
		(typeof status === 'number' &&
			parseInt(String(status), 10) !== status &&
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
	// eslint-disable-next-line class-methods-use-this
	reset() {}

	/**
	 * @returns {void}
	 */
	#validate() {
		if (['matched', 'unmatched'].includes(this.config.name)) {
			throw new Error(
				`fetch-mock: Routes cannot use the reserved name \`${this.config.name}\``,
			);
		}
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
	#sanitize() {
		if (this.config.method) {
			this.config.method = this.config.method.toLowerCase();
		}
	}
	/**
	 * @returns {void}
	 */
	#generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.filter(({ name }) => name in this.config)
			.map(({ matcher, usesBody }) => ({
				matcher: matcher(this.config),
				usesBody,
			}));
		this.config.usesBody = activeMatchers.some(({ usesBody }) => usesBody);
		/** @type {RouteMatcherFunction} */
		this.matcher = (normalizedRequest) =>
			activeMatchers.every(({ matcher }) => matcher(normalizedRequest));
	}
	/**
	 * @returns {void}
	 */
	#limit() {
		if (!this.config.repeat) {
			return;
		}
		const originalMatcher = this.matcher;
		let timesLeft = this.config.repeat;
		this.matcher = (callLog) => {
			const match = timesLeft && originalMatcher(callLog);
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
	 * @returns {{response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig}}
	 */
	constructResponse(responseInput) {
		const responseOptions = this.constructResponseOptions(responseInput);
		const body = this.constructResponseBody(responseInput, responseOptions);

		return {
			response: new this.config.Response(body, responseOptions),
			responseOptions,
			responseInput,
		};
	}
	/**
	 *
	 * @param {RouteResponseConfig} responseInput
	 * @returns {ResponseInitUsingHeaders}
	 */
	constructResponseOptions(responseInput) {
		const options = responseInput.options || {};
		options.status = sanitizeStatus(responseInput.status);
		options.statusText = statusTextMap[options.status];
		// we use Headers rather than an object because it allows us to add
		// to them without worrying about case sensitivity of keys
		options.headers = new this.config.Headers(responseInput.headers);
		return /** @type {ResponseInitUsingHeaders} */ (options);
	}
	/**
	 *
	 * @param {RouteResponseConfig} responseInput
	 * @param {ResponseInitUsingHeaders} responseOptions
	 * @returns {string|null}
	 */
	constructResponseBody(responseInput, responseOptions) {
		// start to construct the body
		let body = responseInput.body;
		// convert to json if we need to
		if (typeof body === 'object') {
			if (
				this.config.sendAsJson &&
				responseInput.body != null //eslint-disable-line
			) {
				body = JSON.stringify(body);
				if (!responseOptions.headers.has('Content-Type')) {
					responseOptions.headers.set('Content-Type', 'application/json');
				}
			}
		}

		if (typeof body === 'string') {
			// add a Content-Length header if we need to
			if (
				this.config.includeContentLength &&
				!responseOptions.headers.has('Content-Length')
			) {
				responseOptions.headers.set('Content-Length', body.length.toString());
			}
			return body;
		}
		// @ts-ignore
		return body || null;
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
