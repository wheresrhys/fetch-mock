//@type-check
import Route from './Route.js';
/** @typedef {import('./Route').RouteOptions} RouteOptions */
/** @typedef {import('./Route').RouteResponse} RouteResponse */
/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */
/** @typedef {import('./FetchMock').FetchMock} FetchMock */
/** @typedef {import('./RequestUtils').NormalizedRequest} NormalizedRequest */
/** @typedef {import('./CallHistory').CallLog} CallLog */

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
		return Boolean(request && this.routes.some(route => route.getOption('usesBody')));
	}

	/**
	 * @param {NormalizedRequest} normalizedRequest
	 * @returns {{route: Route , callLog: CallLog}}
	 */
	execute({ url, options, request }) {
		const route = this.routes.find((route) =>
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

		if (this.config.warnOnFallback) {
			console.warn(
				`Unmatched ${(options && options.method) || 'GET'} to ${url}`,
			); // eslint-disable-line
		}

		if (this.fallbackRoute) {
			return {
				route: this.fallbackRoute,
				callLog: {
					url,
					options,
					request,
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
	 * @param {RouteOptions} matcher
	 * @param {undefined} response
	 * @param {undefined} options
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} options
	 * @returns {void}
	 */
	/**
	 * @param {RouteMatcher | RouteOptions} matcher
	 * @param {RouteResponse} [response]
	 * @param {RouteOptions | string} [options]
	 * @returns {void}
	 */
	addRoute(matcher, response, options) {
		const route = new Route(matcher, response, options, this.config);
		if (
			route.routeOptions.name &&
			this.routes.some(({ routeOptions: {name: existingName }}) => route.routeOptions.name === existingName)
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
		this.fallbackRoute = new Route('*', response || 'ok', undefined, this.config)
	}
	/**
	 *
	 * @param {{force: boolean}} options
	 */
	removeRoutes({ force }) {
		force
			? (this.routes = [])
			: (this.routes = this.routes.filter(({ routeOptions: {sticky }}) => sticky));
	}
}
