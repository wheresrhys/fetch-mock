//@type-check
import Route from './Route.js';
import { isUrlMatcher, isFunctionMatcher } from './Matchers.js';
/** @typedef {import('./Route').UserRouteConfig} UserRouteConfig */
/** @typedef {import('./Route').RouteConfig} RouteConfig */
/** @typedef {import('./Route').RouteResponse} RouteResponse */
/** @typedef {import('./Route').RouteResponseData} RouteResponseData */
/** @typedef {import('./Route').RouteResponseObjectData} RouteResponseObjectData */
/** @typedef {import('./Route').RouteResponseConfig} RouteResponseConfig */
/** @typedef {import('./Route').RouteResponseFunction} RouteResponseFunction */
/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */
/** @typedef {import('./FetchMock')} FetchMock */
/** @typedef {import('./RequestUtils').NormalizedRequest} NormalizedRequest */
/** @typedef {import('./CallHistory').CallLog} CallLog */

const responseConfigProps = [
	'body',
	'headers',
	'throws',
	'status',
	'redirectUrl',
];

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
const isPromise = (response) =>
	typeof (/** @type {Promise<any>} */ (response).then) === 'function';

/**
 *
 * @param {RouteResponseData} responseInput
 * @returns {RouteResponseConfig}
 */
function normalizeResponseInput(responseInput) {
	// If the response config looks like a status, start to generate a simple response
	if (typeof responseInput === 'number') {
		return {
			status: responseInput,
		};
		// If the response config is not an object, or is an object that doesn't use
		// any reserved properties, assume it is meant to be the body of the response
	} else if (
		typeof responseInput === 'string' ||
		shouldSendAsObject(responseInput)
	) {
		return {
			body: responseInput,
		};
	}
	return /** @type{RouteResponseConfig} */ (responseInput);
}

/**
 *
 * @param {RouteResponseData} responseInput
 * @returns {boolean}
 */
function shouldSendAsObject(responseInput) {
	// if (Object.keys(responseInput).some(key => responseConfigProps.includes(key)) {
	// 	if (Object.keys(responseInput).some(key => !responseConfigProps.includes(key)) {
	// 		throw new Error(`Ambiguous whether response is a configuration object `)
	// 	} else {return true}
	// }
	// TODO improve this... make it less hacky and magic
	if (
		responseConfigProps.some(
			(prop) => /** @type {RouteResponseObjectData}*/ (responseInput)[prop],
		)
	) {
		if (
			Object.keys(responseInput).every((key) =>
				responseConfigProps.includes(key),
			)
		) {
			return false;
		}
		return true;
	}
	return true;
}

/**
 * @param {RouteResponse} response
 * @param {NormalizedRequest} normalizedRequest
 * @returns
 */
const resolveUntilResponseConfig = async (response, normalizedRequest) => {
	const { url, options, request } = normalizedRequest;
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
	 * @returns {boolean}
	 */
	needsToReadBody({ request }) {
		return Boolean(
			request && this.routes.some((route) => route.config.usesBody),
		);
	}

	/**
	 * @param {CallLog} callLog
	 * @returns {Promise<Response>}
	 */
	async execute(callLog) {
		const { url, options, request, pendingPromises } = callLog;
		const routesToTry = this.fallbackRoute
			? [...this.routes, this.fallbackRoute]
			: this.routes;
		const route = routesToTry.find((route) =>
			route.matcher(url, options, request),
		);

		if (route) {
			callLog.route = route;
			const { response, responseOptions } = await this.generateResponse(
				route,
				callLog,
			);
			// TODO, get responseConfig out of generateResponse too
			const observableResponse = this.createObservableResponse(
				response,
				responseOptions,
				url,
				pendingPromises,
			);
			callLog.response = response;
			return observableResponse;
		}

		throw new Error(
			`fetch-mock: No response or fallback rule to cover ${
				(options && options.method) || 'GET'
			} to ${url}`,
		);
	}

	/**
	 *
	 * @param {Route} route
	 * @param {CallLog} callLog
	 * @returns {Promise<{response: Response, responseOptions: ResponseInit}>}
	 */
	async generateResponse(route, callLog) {
		const responseInput = await resolveUntilResponseConfig(
			route.config.response,
			callLog,
		);

		// If the response is a pre-made Response, respond with it
		if (responseInput instanceof Response) {
			return { response: responseInput, responseOptions: {} };
		}

		const responseConfig = normalizeResponseInput(responseInput);

		// If the response says to throw an error, throw it
		if (responseConfig.throws) {
			throw responseConfig.throws;
		}

		return route.constructResponse(responseConfig);
	}
	/**
	 *
	 * @param {Response} response
	 * @param {RouteResponseConfig} responseConfig
	 * @param {string} responseUrl
	 * @param {Promise<any>[]} pendingPromises
	 * @returns {Response}
	 */
	createObservableResponse(
		response,
		responseConfig,
		responseUrl,
		pendingPromises,
	) {
		response._fmResults = {};
		// Using a proxy means we can set properties that may not be writable on
		// the original Response. It also means we can track the resolution of
		// promises returned by res.json(), res.text() etc
		return new Proxy(response, {
			get: (originalResponse, name) => {
				if (responseConfig.redirectUrl) {
					if (name === 'url') {
						return responseConfig.redirectUrl;
					}

					if (name === 'redirected') {
						return true;
					}
				} else {
					if (name === 'url') {
						return responseUrl;
					}
					if (name === 'redirected') {
						return false;
					}
				}
				//@ts-ignore
				if (typeof response[name] === 'function') {
					//@ts-ignore
					return new Proxy(response[name], {
						apply: (func, thisArg, args) => {
							const result = func.apply(response, args);
							if (result.then) {
								pendingPromises.push(result.catch(() => null));
								response._fmResults[name] = result;
							}
							return result;
						},
					});
				}
				//@ts-ignore
				return originalResponse[name];
			},
		});
	}

	/**
	 * @overload
	 * @param {UserRouteConfig} matcher
	 * @returns {void}
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [nameOrOptions]
	 * @returns {void}
	 */

	/**
	 * @param {RouteMatcher | UserRouteConfig} matcher
	 * @param {RouteResponse} [response]
	 * @param {UserRouteConfig | string} [nameOrOptions]
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
			...this.config,
			...config,
		});

		if (
			route.config.name &&
			this.routes.some(
				({ config: { name: existingName } }) =>
					route.config.name === existingName,
			)
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

		this.fallbackRoute = new Route({
			matcher: (url, options) => {
				if (this.config.warnOnFallback) {
					console.warn(
						`Unmatched ${(options && options.method) || 'GET'} to ${url}`,
				); // eslint-disable-line
				}
				return true;
			},
			response: response || 'ok',
			...this.config,
		});
		this.fallbackRoute.config.isFallback = true;
	}
	/**
	 *
	 * @param {{force: boolean}} options
	 */
	removeRoutes({ force }) {
		if (force) {
			this.routes = []
		} else {
			this.routes = this.routes.filter(({ config: { sticky } }) => sticky)
		}
	}
}
