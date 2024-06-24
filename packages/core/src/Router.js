//@type-check
import Route from './Route.js';
import { isUrlMatcher, isFunctionMatcher } from './Matchers.js';
/** @typedef {import('./Route').RouteConfig} RouteConfig */
/** @typedef {import('./Route').RouteResponse} RouteResponse */
/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */
/** @typedef {import('./FetchMock')} FetchMock */
/** @typedef {import('./RequestUtils').NormalizedRequest} NormalizedRequest */
/** @typedef {import('./CallHistory').CallLog} CallLog */


/**
 *
 * @param {RouteConfig | string} options
 * @returns {RouteConfig}
 */
const nameToOptions = (options) =>
	typeof options === 'string' ? { name: options } : options;


export default class Router {
	/**
	 * @param {FetchMockConfig} fetchMockConfig
	 * @param {Route[]} [routes]
	 */
	constructor(fetchMockConfig, routes = []) {
		this.routes = routes; // TODO deep clone this
		this.config = fetchMockConfig;
	}
	/**
	 *
	 * @param {NormalizedRequest} requestOptions
	 * @returns {Boolean}
	 */
	needsToReadBody({ request }) {
		return Boolean(request && this.routes.some(route => route.config.usesBody));
	}

	/**
	 * @param {NormalizedRequest} normalizedRequest
	 * @returns {{route: Route , callLog: CallLog}}
	 */
	execute({ url, options, request }) {
		const routesToTry = this.fallbackRoute ? [...this.routes, this.fallbackRoute]: this.routes 
		const route = routesToTry.find((route) =>
			route.matcher(url, options, request),
		);

		if (route) {
			return {
				route,
				callLog: {
					url,
					options,
					request,
					route,
				},
			};
		}

		throw new Error(
			`fetch-mock: No response or fallback rule to cover ${
				(options && options.method) || 'GET'
			} to ${url}`,
		);
	}

	/**
	 * @overload
	 * @param {RouteConfig} matcher
	 * @returns {void}
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteConfig | string} [nameOrOptions]
	 * @returns {void}
	 */

	/**
	 * @param {RouteMatcher | RouteConfig} matcher
	 * @param {RouteResponse} [response]
	 * @param {RouteConfig | string} [nameOrOptions]
	 * @returns {void}
	 */
	addRoute(matcher, response, nameOrOptions) {
		/** @type {RouteConfig} */
		const config = {};
		if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
			config.matcher = matcher;
		} else {
			Object.assign(config, matcher);
		}

		if (typeof response !== 'undefined') {
			config.response = response;
		}

		if (nameOrOptions) {
			Object.assign(
				config,
				typeof nameOrOptions === 'string'
					? nameToOptions(nameOrOptions)
					: nameOrOptions,
			);
		}

		const route = new Route({
			...this.config, ...config
		});

		if (
			route.config.name &&
			this.routes.some(({ config: {name: existingName }}) => route.config.name === existingName)
		) {
			throw new Error(
				'fetch-mock: Adding route with same name as existing route.',
			);
		}
		this.routes.push(route);
	}
	/**
	 * @param {RouteResponse} [response]
	 */
	setFallback(response) {
		if (this.fallbackRoute) {
			console.warn(
				'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response',
			); // eslint-disable-line
		}
		
		this.fallbackRoute = new Route({ matcher: (url, options, request) => {
			if (this.config.warnOnFallback) {
				console.warn(
					`Unmatched ${(options && options.method) || 'GET'} to ${url}`,
				); // eslint-disable-line
			}
			return true;
		}, response: response || 'ok', ...this.config })
		this.fallbackRoute.config.isFallback = true;
	}
	/**
	 *
	 * @param {{force: boolean}} options
	 */
	removeRoutes({ force }) {
		force
			? (this.routes = [])
			: (this.routes = this.routes.filter(({ config: {sticky }}) => sticky));
	}
}
