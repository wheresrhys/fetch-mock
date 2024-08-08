//@type-check
import Router from './Router.js';
import Route from './Route.js';
import CallHistory from './CallHistory.js';
import * as requestUtils from './RequestUtils.js';
/** @typedef {import('./Router.js').RouteMatcher} RouteMatcher */
/** @typedef {import('./Route.js').RouteName} RouteName */
/** @typedef {import('./Route.js').UserRouteConfig} UserRouteConfig */
/** @typedef {import('./Router.js').RouteResponse} RouteResponse */
/** @typedef {import('./Matchers.js').MatcherDefinition} MatcherDefinition */
/** @typedef {import('./CallHistory.js').CallLog} CallLog */
/** @typedef {import('./Route.js').RouteResponseFunction} RouteResponseFunction */

export type FetchMockGlobalConfig = {
	sendAsJson?: boolean;
	includeContentLength?: boolean;
	matchPartialBody?: boolean;
};
export type FetchImplementations = {
	fetch?: typeof fetch;
	Headers?: typeof Headers;
	Request?: typeof Request;
	Response?: typeof Response;
};
export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;

/** @type {FetchMockConfig} */
const defaultConfig = {
	includeContentLength: true,
	sendAsJson: true,
	matchPartialBody: false,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
};

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

export class FetchMock {
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
	 * @param {string | URL | Request} requestInput
	 * @param {RequestInit} [requestInit]
	 * @this {FetchMock}
	 * @returns {Promise<Response>}
	 */
	async fetchHandler(requestInput, requestInit) {
		// TODO move into router
		let callLog;

		if (requestInput instanceof this.config.Request) {
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
	 */
	route(matcher, response, options) {
		this.router.addRoute(matcher, response, options);
		return this;
	}
	/**
	 *
	 * @param {RouteResponse} [response]
	 * @this {FetchMock}
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
	 */
	removeRoutes(options) {
		this.router.removeRoutes(options);
		return this;
	}
	/**
	 * @this {FetchMock}
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

class FetchMockStandalone extends FetchMock {
	/** @type {typeof fetch} */
	#originalFetch = null;
	/**
	 * @this {FetchMockStandalone}
	 */
	mockGlobal() {
		globalThis.fetch = this.fetchHandler.bind(this);
		return this;
	}
	/**
	 * @this {FetchMockStandalone}
	 */
	unmockGlobal() {
		globalThis.fetch = this.config.fetch;
		return this;
	}

	/**
	 * @param {RouteMatcher | UserRouteConfig} [matcher]
	 * @param {RouteName} [name]
	 * @this {FetchMockStandalone}
	 */
	spy(matcher, name) {
		if (matcher) {
			// @ts-ignore
			this.route(matcher, ({ args }) => this.config.fetch(...args), name);
		} else {
			// @ts-ignore
			this.catch(({ args }) => this.config.fetch(...args));
		}

		return this;
	}
	/**
	 * @this {FetchMockStandalone}
	 */
	spyGlobal() {
		this.mockGlobal();
		return this.spy();
	}

	createInstance() {
		return new FetchMockStandalone({ ...this.config }, this.router);
	}
}

const fetchMock = new FetchMockStandalone({
	...defaultConfig,
}).createInstance();

export default fetchMock;
