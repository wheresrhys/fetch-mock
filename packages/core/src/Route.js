//@type-check
import builtInMatchers from './Matchers.js';
/**
 * @typedef RouteResponseObject {
 * @property {string | {}} [body]
 * @property {number} [status]
 * @property {{ [key: string]: string }} [headers]
 * @property {Error} [throws]
 * @property {string} [redirectUrl]
 */

/** @typedef {Response| RouteResponseObject | number| string | Object }  RouteReponseData */
/** @typedef {Promise<RouteReponseData>}  RouteResponsePromise */
/** @typedef  {function(url: string, opts: RouteRequest): (RouteResponseData|RouteResponsePromise)} RouteResponseFunction */
/** @typedef {RouteResponseData | RouteResponsePromise | RouteResponseFunction} RouteResponse*/

/**
 * @typedef RouteOptions
 * @property {string} [name]
 * @property {string} [method]
 * @property {{ [key: string]: string | number }} [headers]
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
 */

/**
 * @param {RouteMatcher | RouteOptions} matcher
 * @returns {boolean}
 */
const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

/**
 *
 * @param {RouteMatcher| RouteOptions} matcher
 * @returns Boolean
 */
const isFunctionMatcher = (matcher) => typeof matcher === 'function';

/**
 *
 * @param {RouteOptions | string} options
 * @returns {RouteOptions}
 */
const nameToOptions = (options) =>
	typeof options === 'string' ? { name: options } : options;

class Route {
	/**
	 * @overload
	 * @param {RouteOptions} matcher
	 * @param {undefined} response
	 * @param {undefined} options
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} options
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @param {RouteMatcher | RouteOptions} matcher
	 * @param {RouteResponse} [response]
	 * @param {RouteOptions | string} [options]
	 * @param {FetchMockConfig} [globalConfig]
	 */
	constructor(matcher, response, options, globalConfig) {
		Object.assign(this, globalConfig);
		this.originalInput = { matcher, response, options };
		this.init();
		this.sanitize();
		this.validate();
		this.generateMatcher();
		this.limit();
		this.delayResponse();
	}
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
		/** @type {RouteOptions} */
		this.routeOptions = routeOptions;
	}
	/**
	 * @returns {void}
	 */
	#sanitize() {
		if (this.routeOptions.method) {
			this.routeOptions.method = this.routeOptions.toLowerCase();
		}
		if (isUrlMatcher(this.routeOptions.matcher)) {
			this.routeOptions.url = this.routeOptions.matcher;
			delete this.routeOptions.matcher;
		}

		this.routeOptions.functionMatcher =
			this.routeOptions.matcher || this.routeOptions.functionMatcher;
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
		const { matcher } = this.routeOptions;
		let timesLeft = this.routeOptions.repeat;
		this.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
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
					setTimeout(() => res(response), this.delay),
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
