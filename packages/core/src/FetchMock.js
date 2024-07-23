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

/** @typedef {'get' |'post' |'put' |'delete' |'head' |'patch' |'once' |'sticky' |'any' |'anyOnce' |'getOnce' |'postOnce' |'putOnce' |'deleteOnce' |'headOnce' |'patchOnce' } AdditionalRouteMethodName */

/**
 *
 * @param {UserRouteConfig} shorthandOptions
 */
const defineShorthand = (shorthandOptions) => {
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
	return function (matcher, response, options) {
		return this.route(
			//@ts-ignore
			matcher,
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	};
};
/**
 *
 * @param {UserRouteConfig} shorthandOptions
 */
const defineGreedyShorthand = (shorthandOptions) => {
	/**
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [options]
	 * @this {FetchMock}
	 * @returns {FetchMock}
	 */
	return function (response, options) {
		return this.route(
			'*',
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	};
};

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

class FetchMock {
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
		return new FetchMock({ ...this.config }, this.router);
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
	 * @returns {FetchMock}
	 */
	/**
	 * @overload
	 * @param {RouteMatcher } matcher
	 * @param {RouteResponse} response
	 * @param {UserRouteConfig | string} [options]
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
	 * @this {FetchMock}
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
	 * @this {FetchMock}
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
	sticky = defineShorthand({ sticky: true });
	once = defineShorthand({ repeat: 1 });
	any = defineGreedyShorthand({});
	anyOnce = defineGreedyShorthand({ repeat: 1 });
	get = defineShorthand({ method: 'get' });
	getOnce = defineShorthand({ method: 'get', repeat: 1 });
	post = defineShorthand({ method: 'post' });
	postOnce = defineShorthand({ method: 'post', repeat: 1 });
	put = defineShorthand({ method: 'put' });
	putOnce = defineShorthand({ method: 'put', repeat: 1 });
	delete = defineShorthand({ method: 'delete' });
	deleteOnce = defineShorthand({ method: 'delete', repeat: 1 });
	head = defineShorthand({ method: 'head' });
	headOnce = defineShorthand({ method: 'head', repeat: 1 });
	patch = defineShorthand({ method: 'patch' });
	patchOnce = defineShorthand({ method: 'patch', repeat: 1 });
}

const fetchMock = new FetchMock({ ...defaultConfig }).createInstance();

export default fetchMock;
