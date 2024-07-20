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
/**
 * @typedef FetchMockCore
 * @this {FetchMock}
 * @property {FetchMockConfig} config
 * @property {Router} router
 * @property {CallHistory} callHistory
 * @property {function():FetchMock} createInstance
 * @property {function(string | Request, RequestInit): Promise<Response>} fetchHandler
 * @property {function(any,any,any): FetchMock} route
 * @property {function(RouteResponse=): FetchMock} catch
 * @property {function(boolean): Promise<any>} flush
 * @property {function(RouteName[]=): boolean} done
 * @property {function(MatcherDefinition):void} defineMatcher
 * @property {function(object): void} removeRoutes
 * @property {function():void} clearHistory
 */

/** @type {FetchMockCore} */
const FetchMock = {
	config: defaultConfig,
	router: new Router(defaultConfig),
	callHistory: new CallHistory(defaultConfig, this.router),
	createInstance() {
		const instance = Object.create(FetchMock);
		instance.config = { ...this.config };
		instance.router = new Router(instance.config, {
			routes: [...this.router.routes],
			fallbackRoute: this.router.fallbackRoute,
		});
		instance.callHistory = new CallHistory(this.config, instance.router);
		return instance;
	},
	/**
	 *
	 * @param {string | Request} requestInput
	 * @param {RequestInit} [requestInit]
	 * @this {FetchMock}
	 * @returns {Promise<Response>}
	 */
	fetchHandler(requestInput, requestInit) {
		// TODO move into router
		const normalizedRequest = requestUtils.normalizeRequest(
			requestInput,
			requestInit,
			this.config.Request,
		);
		/** @type {Promise<any>[]} */
		const pendingPromises = [];
		const callLog = { ...normalizedRequest, pendingPromises };
		this.callHistory.recordCall(callLog);
		const responsePromise = this.router.execute(callLog, normalizedRequest);
		pendingPromises.push(responsePromise);
		return responsePromise;
	},
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
	},
	catch(response) {
		this.router.setFallback(response);
		return this;
	},
	defineMatcher(matcher) {
		Route.defineMatcher(matcher);
	},
	flush(waitForResponseBody) {
		return this.callHistory.flush(waitForResponseBody);
	},
	/**
	 *
	 * @param {RouteName|RouteName[]} routeNames
	 * @returns {boolean}
	 */
	done(routeNames) {
		if (!routeNames) {
			return this.callHistory.done();
		}
		return this.callHistory.done(
			Array.isArray(routeNames) ? routeNames : [routeNames],
		);
	},
	removeRoutes(options) {
		this.router.removeRoutes(options);
		return this;
	},
	clearHistory() {
		this.callHistory.clear();
		return this;
	},
};

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

/** @typedef {FetchMockCore & PresetRoutes} FetchMock*/
Object.assign(FetchMock, PresetRoutes);

export default FetchMock.createInstance();
