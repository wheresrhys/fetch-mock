//@type-check
import builtInMatchers from './Matchers.js';
/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./Matchers').RouteMatcherFunction} RouteMatcherFunction */
/** @typedef {import('./Matchers').RouteMatcherUrl} RouteMatcherUrl */
/** @typedef {import('./Matchers').MatcherDefinition} MatcherDefinition */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */

/**
 * @typedef RouteResponseObject {
 * @property {string | {}} [body]
 * @property {number} [status]
 * @property {{ [key: string]: string }} [headers]
 * @property {Error} [throws]
 * @property {string} [redirectUrl]
 */

/** @typedef {Response| RouteResponseObject | number| string | Object }  RouteResponseData */
/** @typedef {Promise<RouteResponseData>}  RouteResponsePromise */
/** @typedef {function(string, RequestInit, Request=): (RouteResponseData|RouteResponsePromise)} RouteResponseFunction */
/** @typedef {RouteResponseData | RouteResponsePromise | RouteResponseFunction} RouteResponse*/

/** @typedef {string} RouteName */



/**
 * @typedef RouteOptions
 * @property {RouteName} [name]
 * @property {string} [method]
 * @property {{ [key: string]: string | number  }} [headers]
 * @property {{ [key: string]: string }} [query]
 * @property {{ [key: string]: string }} [params]
 * @property {object} [body]
 * @property {RouteMatcherFunction} [functionMatcher]
 * @property {RouteMatcher} [matcher]
 * @property {RouteMatcherUrl} [url]
 * @property {boolean} [overwriteRoutes]
 * @prop {RouteResponse | RouteResponseFunction} [response]
 * @prop {number} [repeat]
 * @prop {number} [delay]
 * @prop {boolean} [sendAsJson]
 * @prop {boolean} [includeContentLength]
 * @prop {boolean} [matchPartialBody]
 * @prop {boolean} [sticky]
 * @prop {boolean} [usesBody]
 */

/**
 * @param {RouteMatcher | RouteOptions} matcher
 * @returns {matcher is RouteMatcherUrl}
 */
const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

/**
 *
 * @param {RouteMatcher| RouteOptions} matcher
 * @returns {matcher is RouteMatcherFunction}
 */
const isFunctionMatcher = (matcher) => typeof matcher === 'function';

/**
 *
 * @param {RouteOptions | string} options
 * @returns {RouteOptions}
 */
const nameToOptions = (options) =>
	typeof options === 'string' ? { name: options } : options;

/** 
 * @class Route 
 */
class Route {
	
	/**
	 * @overload
	 * @param {Object} originalInput
	 * @param {RouteOptions} originalInput.matcher
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @overload
	 * @param {Object} originalInput
	 * @param {RouteMatcher } originalInput.matcher
	 * @param {RouteResponse} originalInput.response
	 * @param {RouteOptions | string} [originalInput.options]
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @param {Object} originalInput
	 * @param {RouteMatcher | RouteOptions} originalInput.matcher
	 * @param {RouteResponse} [originalInput.response]
	 * @param {RouteOptions | string} [originalInput.options]
	 * @param {FetchMockConfig} globalConfig
	 */
	constructor(originalInput, globalConfig) {
		this.globalConfig = globalConfig;
		this.routeOptions = this.globalConfig;
		this.originalInput = originalInput;
		this.#init();
		this.#sanitize();
		this.#validate();
		this.#generateMatcher();
		this.#limit();
		this.#delayResponse();
	}

	/** @type {RouteOptions} */
	routeOptions = {}
	/** @type {RouteMatcherFunction=} */
	matcher = null

	/**
	 * @returns {void}
	 */
	#validate() {
		if (!('response' in this)) {
			throw new Error('fetch-mock: Each route must define a response');
		}

		if (!Route.registeredMatchers.some(({ name }) => name in this)) {
			throw new Error(
				"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'",
			);
		}
	}
	/**
	 * @returns {void}
	 */
	#init() {
		const { matcher, response, options: nameOrOptions } = this.originalInput;
		/** @type {RouteOptions} */
		const routeOptions = {};

		if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
			routeOptions.matcher = matcher;
		} else {
			Object.assign(routeOptions, matcher);
		}

		if (typeof response !== 'undefined') {
			routeOptions.response = response;
		}

		if (nameOrOptions) {
			Object.assign(
				routeOptions,
				typeof nameOrOptions === 'string'
					? nameToOptions(nameOrOptions)
					: nameOrOptions,
			);
		}
		
		this.routeOptions = {
			...this.globalConfig, ...routeOptions};
	}
	/**
	 * @returns {void}
	 */
	#sanitize() {
		if (this.routeOptions.method) {
			this.routeOptions.method = this.routeOptions.method.toLowerCase();
		}
		if (isUrlMatcher(this.routeOptions.matcher)) {
			this.routeOptions.url = this.routeOptions.matcher;
			delete this.routeOptions.matcher;
		}
		if (isFunctionMatcher(this.routeOptions.matcher)) {
			this.routeOptions.functionMatcher = this.routeOptions.matcher;
		}
		
	}
	/**
	 * @returns {void}
	 */
	#generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.map(({ name, matcher, usesBody }) => {
				if (name in this.routeOptions) {
					return { matcher: matcher(this.routeOptions), usesBody };
				}
			})
			.filter((matcher) => Boolean(matcher));

		this.routeOptions.usesBody = activeMatchers.some(
			({ usesBody }) => usesBody,
		);
		/** @type {RouteMatcherFunction} */
		this.matcher = (url, options = {}, request) =>
			activeMatchers.every(({ matcher }) => matcher(url, options, request));
	}
	/**
	 * @returns {void}
	 */
	#limit() {
		if (!this.routeOptions.repeat) {
			return;
		}
		const originalMatcher = this.matcher;
		let timesLeft = this.routeOptions.repeat;
		this.matcher = (url, options, request) => {
			const match = timesLeft && originalMatcher(url, options, request);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => {
			timesLeft = this.routeOptions.repeat;
		};
	}
	/**
	 * @returns {void}
	 */
	#delayResponse() {
		if (this.routeOptions.delay) {
			const { response } = this.routeOptions;
			this.routeOptions.response = () => {
				return new Promise((res) =>
					setTimeout(() => res(response), this.routeOptions.delay),
				);
			};
		}
	}
	/**
	 * @param {MatcherDefinition} matcher
	 */
	static defineMatcher(matcher) {
		Route.registeredMatchers.push(matcher);
	}
	/** @type {MatcherDefinition[]]} */
	static registeredMatchers = [];
}

builtInMatchers.forEach(Route.defineMatcher);

export default Route;
