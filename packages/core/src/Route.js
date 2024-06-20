//@type-check

import builtInMatchers from './Matchers.js';

/**
 * 
 * @param {MockMatcher | MockOptions} matcher 
 * @returns {Boolean}
 */
const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

/**
 * 
 * @param {MockMatcher| MockOptions} matcher 
 * @returns Boolean
 */
const isFunctionMatcher = (matcher) => typeof matcher === 'function';

/**
 * 
 * @param {MockOptions | String} options 
 * @returns {MockOptions}
 */
const nameToOptions = (options) =>
	typeof options === 'string' ? { name: options } : options;


class Route {

	/**
	 * @overload
	 * @param {MockOptions} matcher 
	 * @param {undefined} response
	 * @param {undefined} options
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @overload
	 * @param {MockMatcher } matcher 
	 * @param {MockResponse} response
	 * @param {MockOptions | string} options
	 * @param {FetchMockConfig} globalConfig
	 */

	/**
	 * @param {MockMatcher | MockOptions} matcher 
	 * @param {MockResponse} [response]
	 * @param {MockOptions | string} [options] 
	 * @param {FetchMockConfig} [globalConfig] 
	 */
	constructor(matcher, response, options, globalConfig) {
		Object.assign(this, globalConfig)
		this.originalInput = { matcher, response, options }
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
		const { matcher, response, options: nameOrOptions } = this.originalInput
		const routeConfig = {};

		if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
			routeConfig.matcher = matcher;
		} else {
			Object.assign(routeConfig, matcher);
		}

		if (typeof response !== 'undefined') {
			routeConfig.response = response;
		}

		if (nameOrOptions) {
			Object.assign(
				routeConfig,
				typeof nameOrOptions === 'string'
					? nameToOptions(nameOrOptions)
					: nameOrOptions,
			);
		}

		Object.assign(this, routeConfig);
	}
	/**
	 * @returns {void}
	 */
	#sanitize() {
		if (this.method) {
			this.method = this.method.toLowerCase();
		}
		if (isUrlMatcher(this.matcher)) {
			this.url = this.matcher;
			delete this.matcher;
		}

		this.functionMatcher = this.matcher || this.functionMatcher;
	}
	/**
	 * @returns {void}
	 */
	#generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.map(
				({ name, matcher, usesBody }) => {
					if (name in this) {
						return { matcher: matcher(this), usesBody }
					}
				}
			)
			.filter((matcher) => Boolean(matcher));

		this.usesBody = activeMatchers.some(({ usesBody }) => usesBody);
		this.matcher = (url, options = {}, request) =>
			activeMatchers.every(({ matcher }) => matcher(url, options, request));
	}
	/**
	 * @returns {void}
	 */
	#limit() {
		if (!this.repeat) {
			return;
		}
		const { matcher } = this;
		let timesLeft = this.repeat;
		this.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => {
			timesLeft = this.repeat;
		};
	}
	/**
	 * @returns {void}
	 */
	#delayResponse() {
		if (this.delay) {
			const { response } = this;
			this.response = () => {
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
}
/** @type {MatcherDefinition[]]} */
Route.registeredMatchers = [];

builtInMatchers.forEach(Route.defineMatcher);

export default Route;
