import Router, { RemoveRouteOptions } from './Router.js';
import Route, { RouteName, UserRouteConfig, RouteResponse } from './Route.js';
import { MatcherDefinition, RouteMatcher } from './Matchers.js';
import CallHistory from './CallHistory.js';
import * as requestUtils from './RequestUtils.js';

export type HardResetOptions = {
	includeSticky?: boolean;
};

export type FetchMockGlobalConfig = {
	includeContentLength?: boolean;
	matchPartialBody?: boolean;
	allowRelativeUrls?: boolean;
};
export type FetchImplementations = {
	fetch?: typeof fetch;
	Headers?: typeof Headers;
	Request?: typeof Request;
	Response?: typeof Response;
};
export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;

export const defaultFetchMockConfig: FetchMockConfig = {
	includeContentLength: true,
	matchPartialBody: false,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
};

const defineShorthand = (shorthandOptions: UserRouteConfig) => {
	function shorthand(this: FetchMock, matcher: UserRouteConfig): FetchMock;
	function shorthand(
		this: FetchMock,
		matcher: RouteMatcher,
		response: RouteResponse,
		options?: UserRouteConfig | string,
	): FetchMock;
	function shorthand(
		this: FetchMock,
		matcher: RouteMatcher | UserRouteConfig,
		response?: RouteResponse,
		options?: UserRouteConfig | string,
	): FetchMock {
		return this.route(
			//@ts-expect-error TODO research how to overload an overload
			matcher,
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	}

	return shorthand;
};
const defineGreedyShorthand = (shorthandOptions: UserRouteConfig) => {
	return function (
		this: FetchMock,
		response: RouteResponse,
		options?: UserRouteConfig | string,
	): FetchMock {
		return this.route(
			'*',
			response,
			Object.assign(options || {}, shorthandOptions),
		);
	};
};

export class FetchMock {
	config: FetchMockConfig;
	router: Router;
	callHistory: CallHistory;

	constructor(config: FetchMockConfig, router?: Router) {
		this.config = config;
		this.router = new Router(this.config, {
			routes: router ? [...router.routes] : [],
			fallbackRoute: router ? router.fallbackRoute : null,
		});
		this.callHistory = new CallHistory(this.config, this.router);
		this.fetchHandler = this.fetchHandler.bind(this);
		Object.assign(this.fetchHandler, { fetchMock: this });
	}
	createInstance(): FetchMock {
		return new FetchMock({ ...this.config }, this.router);
	}
	async fetchHandler(
		this: FetchMock,
		requestInput: string | URL | Request,
		requestInit?: RequestInit,
	): Promise<Response> {
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

	route(matcher: UserRouteConfig): FetchMock;
	route(
		matcher: RouteMatcher,
		response: RouteResponse,
		options?: UserRouteConfig | string,
	): FetchMock;
	route(
		matcher: RouteMatcher | UserRouteConfig,
		response?: RouteResponse,
		options?: UserRouteConfig | string,
	): FetchMock {
		this.router.addRoute(matcher, response, options);
		return this;
	}

	catch(response?: RouteResponse): FetchMock {
		this.router.setFallback(response);
		return this;
	}
	defineMatcher(matcher: MatcherDefinition) {
		Route.defineMatcher(matcher);
	}
	removeRoutes(options?: RemoveRouteOptions): FetchMock {
		this.router.removeRoutes(options);
		return this;
	}

	removeRoute(routeName: string): FetchMock {
		this.router.removeRoutes({ names: [routeName] });
		return this;
	}

	clearHistory(): FetchMock {
		this.callHistory.clear();
		return this;
	}
	mockGlobal(this: FetchMock): FetchMock {
		globalThis.fetch = this.fetchHandler;
		return this;
	}
	unmockGlobal(this: FetchMock): FetchMock {
		globalThis.fetch = this.config.fetch;
		return this;
	}

	hardReset(options?: HardResetOptions): FetchMock {
		this.clearHistory();
		this.removeRoutes(options as RemoveRouteOptions);
		this.unmockGlobal();
		return this;
	}

	spy(
		this: FetchMock,
		matcher?: RouteMatcher | UserRouteConfig,
		name?: RouteName,
	): FetchMock {
		const boundFetch = this.config.fetch.bind(globalThis);
		if (matcher) {
			this.route(
				// @ts-expect-error related to the overloading of .route()
				matcher,
				// @ts-expect-error this is just args from a fetch call being passed into a bound fetch - no idea why the error
				({ args }) => boundFetch(...args),
				name,
			);
		} else {
			// @ts-expect-error this is just args from a fetch call being passed into a bound fetch - no idea why the error
			this.catch(({ args }) => boundFetch(...args));
		}

		return this;
	}
	spyGlobal(this: FetchMock): FetchMock {
		this.mockGlobal();
		return this.spy();
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

const fetchMock = new FetchMock({
	...defaultFetchMockConfig,
});

export default fetchMock;
