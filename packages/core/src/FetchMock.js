//@type-check
import fetchHandler from './FetchHandler.js';
import Router from './Router.js';
import Route from './Route.js';
import CallHistory from './CallHistory.js';
/** @typedef {import('./Router').RouteMatcher} RouteMatcher */
/** @typedef {import('./Router').RouteOptions} RouteOptions */
/** @typedef {import('./Router').RouteResponse} RouteResponse */
/** @typedef {import('./Matchers').MatcherDefinition} MatcherDefinition */
/**
 * @typedef FetchMockConfig
 * @prop {boolean} [sendAsJson]
 * @prop {boolean} [includeContentLength]
 * @prop {boolean} [warnOnFallback]
 * @prop {function(string | Request, RequestInit): Promise<Response>} [fetch]
 * @prop {new () => Headers} [Headers]
 * @prop {typeof Request} [Request]
 * @prop {new () => Response} [Response]
 */

/** @type {FetchMockConfig} */
const defaultConfig = {
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
};

/** 
 * @typedef FetchMockCore 
 * @this {FetchMock} 
 * @prop {FetchMockConfig} config
 * @prop {Router} router
 * @prop {CallHistory} callHistory
 * @prop {function():FetchMock} createInstance
 * @prop {function(string | Request, RequestInit): Promise<Response>} fetchHandler
 * @prop {function(...RouteArgs): FetchMock} route
 * @prop {function(RouteResponse=): FetchMock} catch
 * @prop {function(MatcherDefinition):void} defineMatcher
 */




/** @type {FetchMockCore} */
const FetchMock = {
	config: defaultConfig,

	router: new Router(defaultConfig),
	callHistory: new CallHistory(defaultConfig),
	createInstance() {
		const instance = Object.create(FetchMock);
		instance.config = {...this.config};
		instance.router = new Router(instance.config, this.router.routes);
		instance.callHistory = new CallHistory(this.config);
		return instance;
	},
	/**
	 * @this {FetchMock}
	 */
	fetchHandler(requestInput, requestInit) {
		return fetchHandler.call(this, requestInput, requestInit);
	},
	/**
	 * @overload
	 * @param {RouteOptions} matcher
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} [options]
	 */

	/**
	 * @param {RouteMatcher | RouteOptions} matcher
	 * @param {RouteResponse} [response]
	 * @param {RouteOptions | string} [options]
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
	done(routeNames) {
		return this.callHistory.done(this.router.routes, routeNames)
	}
};

/** @typedef {'get' |'post' |'put' |'delete' |'head' |'patch' |'once' |'sticky' |'any' |'anyOnce' |'getOnce' |'postOnce' |'putOnce' |'deleteOnce' |'headOnce' |'patchOnce' |'getAny' |'postAny' |'putAny' |'deleteAny' |'headAny' |'patchAny' |'getAnyOnce' |'postAnyOnce' |'putAnyOnce' |'deleteAnyOnce' |'headAnyOnce' |'patchAnyOnce'} PresetRouteMethodName} */
/** @typedef {Object.<PresetRouteMethodName, function(...RouteArgs): FetchMock>} PresetRoutes */



/** @type {PresetRoutes} */
const PresetRoutes = {}
/**
 * 
 * @param {PresetRouteMethodName} methodName 
 * @param {string} underlyingMethod 
 * @param {RouteOptions} shorthandOptions 
 */
const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
	/**
	 * @overload
	 * @param {RouteOptions} matcher
	 */

	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} [options]
	 */

	/**
	 * @param {RouteMatcher | RouteOptions} matcher
	 * @param {RouteResponse} [response]
	 * @param {RouteOptions | string} [options]
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
	 * @overload
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} [options]
	 */
	PresetRoutes[methodName] = function (response, options) {
		return this[underlyingMethod]({}, response, options);
	};
};

defineShorthand('sticky', 'route', { sticky: true });
defineShorthand('once', 'route', { repeat: 1 });
defineGreedyShorthand('any', 'route');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
	defineShorthand(/** @type {PresetRouteMethodName} */(method), 'route', { method });
	defineShorthand(/** @type {PresetRouteMethodName} */(`${method}Once`), 'once', { method });
	defineGreedyShorthand(/** @type {PresetRouteMethodName} */(`${method}Any`), method);
	defineGreedyShorthand(/** @type {PresetRouteMethodName} */(`${method}AnyOnce`), `${method}Once`);
});


/** @typedef {FetchMockCore & PresetRoutes} FetchMock*/
Object.assign(FetchMock, PresetRoutes)

export default FetchMock.createInstance();



