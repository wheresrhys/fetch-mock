//@type-check
import Route from './Route.js';
import { isUrlMatcher, isFunctionMatcher } from './Matchers.js';
/** @typedef {import('./Route.js').UserRouteConfig} UserRouteConfig */
/** @typedef {import('./Route.js').RouteConfig} RouteConfig */
/** @typedef {import('./Route.js').RouteResponse} RouteResponse */
/** @typedef {import('./Route.js').RouteResponseData} RouteResponseData */
/** @typedef {import('./Route.js').RouteResponseObjectData} RouteResponseObjectData */
/** @typedef {import('./Route.js').RouteResponseConfig} RouteResponseConfig */
/** @typedef {import('./Route.js').RouteResponseFunction} RouteResponseFunction */
/** @typedef {import('./Matchers.js').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock.js').FetchMockConfig} FetchMockConfig */
/** @typedef {import('./FetchMock.js')} FetchMock */
/** @typedef {import('./CallHistory.js').CallLog} CallLog */

/** @typedef {'body' |'headers' |'throws' |'status' |'redirectUrl' } ResponseConfigProp */

/** @type {ResponseConfigProp[]} */
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
			(prop) => /** @type {RouteResponseConfig}*/ (responseInput)[prop],
		)
	) {
		if (
			Object.keys(responseInput).every((key) =>
				responseConfigProps.includes(/** @type {ResponseConfigProp} */ (key)),
			)
		) {
			return false;
		}
		return true;
	}
	return true;
}

/**
 * @param {CallLog} callLog
 * @returns
 */
const resolveUntilResponseConfig = async (callLog) => {
	// We want to allow things like
	// - function returning a Promise for a response
	// - delaying (using a timeout Promise) a function's execution to generate
	//   a response
	// Because of this we can't safely check for function before Promisey-ness,
	// or vice versa. So to keep it DRY, and flexible, we keep trying until we
	// have something that looks like neither Promise nor function
	//eslint-disable-next-line no-constant-condition
	let response = callLog.route.config.response;
	// eslint-disable-next-line  no-constant-condition
	while (true) {
		if (typeof response === 'function') {
			response = response(callLog);
		} else if (isPromise(response)) {
			response = await response; // eslint-disable-line  no-await-in-loop
		} else {
			return response;
		}
	}
};

export default class Router {
	/** @type {Route[]} */
	routes = [];
	/**
	 * @param {FetchMockConfig} fetchMockConfig
	 * @param {object} [inheritedRoutes]
	 * @param {Route[]} [inheritedRoutes.routes]
	 * @param {Route} [inheritedRoutes.fallbackRoute]
	 */
	constructor(fetchMockConfig, { routes, fallbackRoute } = {}) {
		this.config = fetchMockConfig;
		this.routes = routes || []; // TODO deep clone this??
		this.fallbackRoute = fallbackRoute;
	}
	/**
	 *
	 * @param {Request} request
	 * @returns {boolean}
	 */
	needsToReadBody(request) {
		return Boolean(
			request && this.routes.some((route) => route.config.usesBody),
		);
	}

	/**
	 * @param {CallLog} callLog
	 * @returns {Promise<Response>}
	 */
	execute(callLog) {
		// TODO make abort vs reject neater
		return new Promise(async (resolve, reject) => {
			const { url, options, request, pendingPromises } = callLog;
			if (callLog.signal) {
				const abort = () => {
					// TODO may need to bring that flushy thing back.
					// Add a test to combvine flush with abort
					// done();
					const error = new DOMException(
						'The operation was aborted.',
						'AbortError',
					);

					const requestBody = request?.body || options?.body;
					if (requestBody instanceof ReadableStream) {
						requestBody.cancel(error);
					}

					if (callLog?.response?.body) {
						callLog.response.body.cancel(error);
					}
					reject(error);
				};
				if (callLog.signal.aborted) {
					abort();
				}
				callLog.signal.addEventListener('abort', abort);
			}
			if (this.needsToReadBody(request)) {
				options.body = await options.body;
			}

			const routesToTry = this.fallbackRoute
				? [...this.routes, this.fallbackRoute]
				: this.routes;
			const route = routesToTry.find((route) => route.matcher(callLog));

			if (route) {
				try {
					callLog.route = route;
					const { response, responseOptions, responseInput } =
						await this.generateResponse(callLog);
					const observableResponse = this.createObservableResponse(
						response,
						responseOptions,
						responseInput,
						url,
						pendingPromises,
					);
					callLog.response = response;
					resolve(observableResponse);
				} catch (err) {
					reject(err);
				}
			} else {
				reject(
					new Error(
						`fetch-mock: No response or fallback rule to cover ${
							(options && options.method) || 'GET'
						} to ${url}`,
					),
				);
			}
		});
	}

	/**
	 *
	 * @param {CallLog} callLog
	 * @returns {Promise<{response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig}>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async generateResponse(callLog) {
		const responseInput = await resolveUntilResponseConfig(callLog);

		// If the response is a pre-made Response, respond with it
		if (responseInput instanceof Response) {
			return {
				response: responseInput,
				responseOptions: {},
				responseInput: {},
			};
		}

		const responseConfig = normalizeResponseInput(responseInput);

		// If the response says to throw an error, throw it
		if (responseConfig.throws) {
			throw responseConfig.throws;
		}

		return callLog.route.constructResponse(responseConfig);
	}
	/**
	 *
	 * @param {Response} response
	 * @param {ResponseInit} responseConfig
	 * @param {RouteResponseConfig} responseInput
	 * @param {string} responseUrl
	 * @param {Promise<any>[]} pendingPromises
	 * @returns {Response}
	 */
	// eslint-disable-next-line class-methods-use-this
	createObservableResponse(
		response,
		responseConfig,
		responseInput,
		responseUrl,
		pendingPromises,
	) {
		// Using a proxy means we can set properties that may not be writable on
		// the original Response. It also means we can track the resolution of
		// promises returned by res.json(), res.text() etc
		return new Proxy(response, {
			get: (originalResponse, name) => {
				if (responseInput.redirectUrl) {
					if (name === 'url') {
						return responseInput.redirectUrl;
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
						apply: (matcherFunction, thisArg, args) => {
							const result = matcherFunction.apply(response, args);
							if (result.then) {
								pendingPromises.push(
									result.catch(/** @type {function(): void} */ () => undefined),
								);
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
	 * @param {RouteMatcher | UserRouteConfig} matcher
	 * @param {RouteResponse} [response]
	 * @param {UserRouteConfig | string} [nameOrOptions]
	 * @returns {void}
	 */
	addRoute(matcher, response, nameOrOptions) {
		/** @type {RouteConfig} */
		const config = {};
		if (isUrlMatcher(matcher)) {
			config.url = matcher;
		} else if (isFunctionMatcher(matcher)) {
			config.matcherFunction = matcher;
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
			matcherFunction: () => true,
			response: response || 'ok',
			...this.config,
		});
		this.fallbackRoute.config.isFallback = true;
	}
	/**
	 *
	 * @param {object} [options]
	 * @param {string[]} [options.names]
	 * @param {boolean} [options.includeSticky]
	 * @param {boolean} [options.includeFallback]
	 */
	removeRoutes({ names, includeSticky, includeFallback } = {}) {
		includeFallback = includeFallback ?? true;
		this.routes = this.routes.filter(({ config: { sticky, name } }) => {
			if (sticky && !includeSticky) {
				return true;
			}
			if (!names) {
				return false;
			}
			return !names.includes(name);
		});
		if (includeFallback) {
			delete this.fallbackRoute;
		}
	}
}
