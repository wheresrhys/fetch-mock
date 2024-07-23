//@type-check
import Router from './Router.js';
import Route from './Route.js';
import CallHistory from './CallHistory.js';
import * as requestUtils from './RequestUtils.js';
/** @typedef {import('./Router').RouteMatcher} RouteMatcher */
/** @typedef {import('./Route').RouteName} RouteName */
/** @typedef {import('./Route').UserRouteConfig} UserRouteConfig */
/** @typedef {import('./Router').RouteResponse} RouteResponse */
/** @typedef {import('./Matchers').MatcherDefinition} MatcherDefinition */
/** @typedef {import('./CallHistory').CallLog} CallLog */
/** @typedef {import('./Route').RouteResponseFunction} RouteResponseFunction */

/**
 * @typedef FetchMockConfig
 * @property {boolean} [sendAsJson]
 * @property {boolean} [includeContentLength]
 * @property {boolean} [warnOnFallback]
 * @property {boolean} [matchPartialBody]
 * @property {function(string | Request, RequestInit): Promise<Response>} [fetch]
 * @property {typeof Headers} [Headers]
 * @property {typeof Request} [Request]
 * @property {typeof Response} [Response]
 */

/** @type {FetchMockConfig} */
const defaultConfig = {
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	matchPartialBody: false,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
};

/** @typedef {FetchMockCore & PresetRoutes} FetchMock*/

class FetchMockCore {
	/**
	 *
	 * @param {FetchMockConfig} config
	 * @param {Router} [router]
	 */
	constructor(config, router) {
		this.config = config;
		this.router = new Router(this.config, {
			routes: router ? [...router.routes] : [],
			fallbackRoute: router ? router.fallbackRoute : null,
		});
		this.callHistory = new CallHistory(this.config, this.router);
	}
	/**
	 *
	 * @returns {FetchMock}
	 */
	createInstance() {
		const instance = new FetchMockCore({ ...this.config }, this.router);
		return Object.assign(instance, PresetRoutes);
	}
	/**
	 *
	 * @param {string | Request} requestInput
	 * @param {RequestInit} [requestInit]
	 * @this {FetchMock}
	 * @returns {Promise<Response>}
	 */
	async fetchHandler(requestInput, requestInit) {
		// TODO move into router
		let callLog;
		if (requestUtils.isRequest(requestInput, this.config.Request)) {
			callLog = await requestUtils.createCallLogFromRequest(
				requestInput,
				requestInit,
			);
		} else {
			callLog = requestUtils.createCallLogFromUrlAndOptions(
				requestInput,
				requestInit,
			);
		}

		this.callHistory.recordCall(callLog);
		const responsePromise = this.router.execute(callLog);
		callLog.pendingPromises.push(responsePromise);
		return responsePromise;
	}
	/**
	 * @overload
	 * @param {UserRouteConfig} matcher
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */

	/**
	 * @param {RouteMatcher | UserRouteConfig} matcher
	 * @param {RouteResponse} [response]
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */
	route(matcher, response, options) {
		this.router.addRoute(matcher, response, options);
		return this;
	}
	/**
	 *
	 * @param {RouteResponse} [response]
	 * @returns {FetchMock}
	 */
	catch(response) {
		this.router.setFallback(response);
		return this;
	}
	/**
	 *
	 * @param {MatcherDefinition} matcher
	 */
	//eslint-disable-next-line class-methods-use-this
	defineMatcher(matcher) {
		Route.defineMatcher(matcher);
	}
	/**
	 *
	 * @param {object} [options]
	 * @param {string[]} [options.names]
	 * @param {boolean} [options.includeSticky]
	 * @param {boolean} [options.includeFallback]
	 * @returns {FetchMock}
	 */
	removeRoutes(options) {
		this.router.removeRoutes(options);
		return this;
	}
	/**
	 *
	 * @returns {FetchMock}
	 */
	clearHistory() {
		this.callHistory.clear();
		return this;
	}
}

/** @typedef {'get' |'post' |'put' |'delete' |'head' |'patch' |'once' |'sticky' |'any' |'anyOnce' |'getOnce' |'postOnce' |'putOnce' |'deleteOnce' |'headOnce' |'patchOnce' |'getAny' |'postAny' |'putAny' |'deleteAny' |'headAny' |'patchAny' |'getAnyOnce' |'postAnyOnce' |'putAnyOnce' |'deleteAnyOnce' |'headAnyOnce' |'patchAnyOnce'} PresetRouteMethodName} */
/** @typedef {Object.<PresetRouteMethodName, function(any,any,any): FetchMock>} PresetRoutes */

/** @type {PresetRoutes} */
const PresetRoutes = {};
/**
 *
 * @param {PresetRouteMethodName} methodName
 * @param {string} underlyingMethod
 * @param {UserRouteConfig} shorthandOptions
 */
const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
	/**
	 * @overload
	 * @param {UserRouteConfig} matcher
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */

	/**
	 * @param {RouteMatcher | UserRouteConfig} matcher
	 * @param {RouteResponse} [response]
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */
	PresetRoutes[methodName] = function (matcher, response, options) {
		return this[underlyingMethod](
			matcher,
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	};
};
/**
 *
 * @param {PresetRouteMethodName} methodName
 * @param {string} underlyingMethod
 */
const defineGreedyShorthand = (methodName, underlyingMethod) => {
	/**
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */
	PresetRoutes[methodName] = function (response, options) {
		return this[underlyingMethod]('*', response, options);
	};
};

defineShorthand('sticky', 'route', { sticky: true });
defineShorthand('once', 'route', { repeat: 1 });
defineGreedyShorthand('any', 'route');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
	defineShorthand(/** @type {PresetRouteMethodName} */ (method), 'route', {
		method,
	});
	defineShorthand(
		/** @type {PresetRouteMethodName} */ (`${method}Once`),
		'once',
		{ method },
	);
	defineGreedyShorthand(
		/** @type {PresetRouteMethodName} */ (`${method}Any`),
		method,
	);
	defineGreedyShorthand(
		/** @type {PresetRouteMethodName} */ (`${method}AnyOnce`),
		`${method}Once`,
	);
});

const fetchMock = new FetchMockCore({ ...defaultConfig }).createInstance();

console.log(fetchMock);
export default fetchMock;
