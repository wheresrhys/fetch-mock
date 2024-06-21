//@type-check
import fetchHandler from './FetchHandler.js';
import Router from './Router.js';
import Route from './Route.js';
import CallHistory from './CallHistory.js';

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
 * @type FetchMock 
 */
const FetchMock = {
	/**
	 * @type {FetchMockConfig}
	 */
	config: defaultConfig,
	/**
	 * @returns {FetchMock}
	 */
	createInstance() {
		const instance = Object.create(FetchMock);
		instance.router = new Router(this.config, this.router.routes);
		instance.callHistory = new CallHistory(this.config);
		return instance;
	},
	/**
	 *
	 * @param {string | Request} requestInput
	 * @param {RequestInit} [requestInit]
	 * @returns {Promise<Response>}
	 */
	fetchHandler(requestInput, requestInit) {
		return fetchHandler.call(this, requestInput, requestInit);
	},

	/**
	 * @overload
	 * @param {RouteOptions} matcher
	 * @param {undefined} response
	 * @param {undefined} options
	 */
	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {RouteOptions | string} options
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
	/**
	 * @param {RouteResponse} response
	 * @return {FetchMock}
	 */
	catch(response) {
		this.router.setFallback(response);
		return this;
	},
	/**
	 *
	 * @param {MatcherDefinition} matcher
	 */
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
/**
 * 
 * @param {string} methodName 
 * @param {string} underlyingMethod 
 * @param {RouteOptions} shorthandOptions 
 */
const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
	FetchMock[methodName] = function (matcher, response, options) {
		return this[underlyingMethod](
			matcher,
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	};
};
/**
 * 
 * @param {string} methodName 
 * @param {string} underlyingMethod 
 */
const defineGreedyShorthand = (methodName, underlyingMethod) => {
	FetchMock[methodName] = function (response, options) {
		return this[underlyingMethod]({}, response, options);
	};
};

defineShorthand('sticky', 'route', { sticky: true });
defineShorthand('once', 'route', { repeat: 1 });
defineGreedyShorthand('any', 'route');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
	defineShorthand(method, 'route', { method });
	defineShorthand(`${method}Once`, 'once', { method });
	defineGreedyShorthand(`${method}Any`, method);
	defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
});

export default FetchMock.createInstance();
