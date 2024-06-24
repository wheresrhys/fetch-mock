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
 * @prop {boolean} [sendAsJson]
 * @prop {boolean} [includeContentLength]
 * @prop {boolean} [warnOnFallback]
 * @prop {function(string | Request, RequestInit): Promise<Response>} [fetch]
 * @prop {typeof Headers} [Headers]
 * @prop {typeof Request} [Request]
 * @prop {typeof Response} [Response]
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
 * @prop {function(any,any,any): FetchMock} route
 * @prop {function(RouteResponse=): FetchMock} catch
 * @prop {function(boolean): Promise<any>} flush
 * @prop {function(RouteName[]=): boolean} done
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
	 *
	 * @param {string | Request} requestInput
	 * @param {RequestInit} [requestInit]
	 * @this {FetchMock}
	 * @returns {Promise<Response>}
	 */
	async fetchHandler (requestInput, requestInit) {
		const normalizedRequest = requestUtils.normalizeRequest(
			requestInput,
			requestInit,
			this.config.Request,
		);
		const { url, options, request, signal } = normalizedRequest;

		if (signal) {
			const abort = () => {
				done();
				throw new DOMException('The operation was aborted.', 'AbortError');
			};
			if (signal.aborted) {
				abort();
			}
			signal.addEventListener('abort', abort);
		}

		if (this.router.needsToReadBody(options)) {
			options.body = await options.body;
		}

		const { callLog, response } = this.router.execute(normalizedRequest);
		// TODO log the call IMMEDIATELY and then route gradually adds to it
		this.callHistory.recordCall(callLog);

		// this is used to power the .flush() method
		/** @type {function(any): void} */
		let done;

		// TODO holding promises should be attached to each callLog
		this.callHistory.addHoldingPromise(
			new Promise((res) => {
				done = res;
			}),
		);

		response.then(done, done);

		return response;
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
	done(routeNames) {
		return this.callHistory.done(this.router.routes, routeNames)
	}
};

/** @typedef {'get' |'post' |'put' |'delete' |'head' |'patch' |'once' |'sticky' |'any' |'anyOnce' |'getOnce' |'postOnce' |'putOnce' |'deleteOnce' |'headOnce' |'patchOnce' |'getAny' |'postAny' |'putAny' |'deleteAny' |'headAny' |'patchAny' |'getAnyOnce' |'postAnyOnce' |'putAnyOnce' |'deleteAnyOnce' |'headAnyOnce' |'patchAnyOnce'} PresetRouteMethodName} */
/** @typedef {Object.<PresetRouteMethodName, function(any,any,any): FetchMock>} PresetRoutes */



/** @type {PresetRoutes} */
const PresetRoutes = {}
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