//@type-check
import Route from './Route.js';
import { isUrlMatcher, isFunctionMatcher } from './Matchers.js';
import { buildResponse } from './ResponseBuilder.js';
/** @typedef {import('./Route').RouteConfig} RouteConfig */
/** @typedef {import('./Route').RouteResponse} RouteResponse */
/** @typedef {import('./Route').RouteResponseFunction} RouteResponseFunction */
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

/**
 * 
 * @param {RouteResponse} response 
 * @returns {RouteResponse is RouteResponseFunction}
 */
const isPromise = response => typeof /** @type {Promise<any>} */(response).then === 'function'

/**
 * @param {RouteResponse} response
 * @param {string} url
 * @param {RequestInit} options
 * @param {Request} request
 * @returns
 */
const resolveUntilResponseConfig = async (
	response,
	url,
	options,
	request,
) => {
	// We want to allow things like
	// - function returning a Promise for a response
	// - delaying (using a timeout Promise) a function's execution to generate
	//   a response
	// Because of this we can't safely check for function before Promisey-ness,
	// or vice versa. So to keep it DRY, and flexible, we keep trying until we
	// have something that looks like neither Promise nor function
	//eslint-disable-next-line no-constant-condition
	while (true) {
		if (typeof response === 'function') {
			response = response(url, options, request);
		} else if (isPromise(response)) {
			response = await response; // eslint-disable-line  no-await-in-loop
		} else {
			return response;
		}
	}
};

/**
 *
 * @param {Object} input
 * @param {Route} input.route
 * @param {string} input.url
 * @param {RequestInit} input.options
 * @param {Request} [input.request]
 * @param {CallLog} input.callLog
 * @returns {Promise<Response>}
 */
const generateResponse = async ({
	route,
	url,
	options,
	request,
	callLog,
}) => {
	const response = await resolveUntilResponseConfig(
		route.config.response,
		url,
		options,
		request,
	);

	const [realResponse, finalResponse] = buildResponse({
		url,
		responseConfig: response,
		route,
	});

	callLog.response = realResponse;

	return finalResponse;
};

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
	 * @returns {{route: Route , callLog: CallLog, response: Promise<Response>}}
	 */
	execute({ url, options, request }) {
		const routesToTry = this.fallbackRoute ? [...this.routes, this.fallbackRoute]: this.routes 
		const route = routesToTry.find((route) =>
			route.matcher(url, options, request),
		);

		if (route) {
			const callLog = {
				url,
				options,
				request,
				route,
			}
			const response = generateResponse({
				route,
				url,
				options,
				request,
				callLog,
			});
			return {
				response,
				route,
				callLog,
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
