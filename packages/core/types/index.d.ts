declare namespace fetchMockCore {
	// CallHistory
	export type Matched = "matched";
	export type Unmatched = "unmatched";
	export type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;
	export type CallLog = {
	    arguments: any[];
	    url: string;
	    options: NormalizedRequestOptions;
	    request?: Request;
	    signal?: AbortSignal;
	    route?: Route;
	    response?: Response;
	    expressParams?: {
	        [x: string]: string;
	    };
	    queryParams?: {
	        [x: string]: string;
	    };
	    pendingPromises: Promise<any>[];
	}

	declare class CallHistory {
	    /**
	     * @param {FetchMockConfig} globalConfig
	     * @param {Router} router
	     */
	    constructor(globalConfig: FetchMockConfig, router: Router);
	    /** @type {CallLog[]} */
	    callLogs: CallLog[];
	    config: import("./FetchMock").FetchMockConfig;
	    router: Router;
	    /**
	     *
	     * @param {CallLog} callLog
	     */
	    recordCall(callLog: CallLog): void;
	    clear(): void;
	    /**
	     *
	     * @param {boolean} [waitForResponseMethods]
	     * @returns {Promise<void>}
	     */
	    flush(waitForResponseMethods?: boolean): Promise<void>;
	    /**
	     *
	     * @param {CallHistoryFilter} filter
	     * @param {RouteConfig} options
	     * @returns {CallLog[]}
	     */
	    calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[];
	    /**
	     *
	     * @param {CallHistoryFilter} filter
	     * @param {RouteConfig} options
	     * @returns {boolean}
	     */
	    called(filter: CallHistoryFilter, options: RouteConfig): boolean;
	    /**
	     *
	     * @param {CallHistoryFilter} filter
	     * @param {RouteConfig} options
	     * @returns {CallLog}
	     */
	    lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog;
	    /**
	     * @param {RouteName|RouteName[]} [routeNames]
	     * @returns {boolean}
	     */
	    done(routeNames?: RouteName | RouteName[]): boolean;
	}

	// FetchMock
	export type FetchMockConfig = {
      sendAsJson?: boolean;
      includeContentLength?: boolean;
      warnOnFallback?: boolean;
      matchPartialBody?: boolean;
      fetch?: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
      Headers?: typeof Headers;
      Request?: typeof Request;
      Response?: typeof Response;
  };
  type FetchMockCore = {
      config: FetchMockConfig;
      router: Router;
      callHistory: CallHistory;
      createInstance: () => FetchMock;
      fetchHandler: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
      route: (arg0: any, arg1: any, arg2: any) => FetchMock;
      catch: (arg0: RouteResponse | undefined) => FetchMock;
      defineMatcher: (arg0: MatcherDefinition) => void;
      removeRoutes: (arg0: object) => void;
      clearHistory: () => void;
  };
  // TODO distinguish between different methods's signatures here
  type PresetRouteMethodName = "get" | "post" | "put" | "delete" | "head" | "patch" | "once" | "sticky" | "any" | "anyOnce" | "getOnce" | "postOnce" | "putOnce" | "deleteOnce" | "headOnce" | "patchOnce" | "getAny" | "postAny" | "putAny" | "deleteAny" | "headAny" | "patchAny" | "getAnyOnce" | "postAnyOnce" | "putAnyOnce" | "deleteAnyOnce" | "headAnyOnce" | "patchAnyOnce";
  type PresetRoutes = {
      [x: PresetRouteMethodName]: function(any,any,any) => FetchMock;
  }

  export type FetchMock = FetchMockCore & PresetRoutes;

  // Matchers
	export type RouteMatcherUrl = string | RegExp | URL;
  type UrlMatcherGenerator = (arg0: string) => RouteMatcherFunction;
  export type RouteMatcherFunction = (arg0: CallLog) => boolean;
  export type MatcherGenerator = (arg0: RouteConfig) => RouteMatcherFunction;
  export type RouteMatcher = RouteMatcherUrl | RouteMatcherFunction;
  export type MatcherDefinition = {
      name: string;
      matcher: MatcherGenerator;
      usesBody?: boolean;
  };

  //Route
	export type RouteResponseConfig = {
	    body?: string | {};
	    status?: number;
	    headers?: {
	        [key: string]: string;
	    };
	    throws?: Error;
	    redirectUrl?: string;
	    options?: ResponseInit;
	};

	type ResponseInitUsingHeaders = {
	    status: number;
	    statusText: string;
	    headers: Headers;
	};
	type RouteResponseObjectData = RouteResponseConfig | object;
	type RouteResponseData = Response | number | string | RouteResponseObjectData;
	type RouteResponsePromise = Promise<RouteResponseData>;
	type RouteResponseFunction = (arg0: CallLog) => (RouteResponseData | RouteResponsePromise);
	export type RouteResponse = RouteResponseData | RouteResponsePromise | RouteResponseFunction;
	export type RouteName = string;
	export type UserRouteConfig = {
	    name?: RouteName;
	    method?: string;
	    headers?: {
	        [key: string]: string | number;
	    };
	    query?: {
	        [key: string]: string;
	    };
	    params?: {
	        [key: string]: string;
	    };
	    body?: object;
	    matcherFunction?: RouteMatcherFunction;
	    matcher?: RouteMatcher;
	    url?: RouteMatcherUrl;
	    response?: RouteResponse | RouteResponseFunction;
	    repeat?: number;
	    delay?: number;
	    sendAsJson?: boolean;
	    includeContentLength?: boolean;
	    matchPartialBody?: boolean;
	    sticky?: boolean;
	    usesBody?: boolean;
	    isFallback?: boolean;
	};
	// Split into FetchMockConfig UserRouteConfig & INternalRouteConfig
	export type RouteConfig = UserRouteConfig & FetchMockConfig;

	declare class Route {

	    static defineMatcher(matcher: MatcherDefinition): void;
	    static registeredMatchers: MatcherDefinition[];
	    constructor(config: RouteConfig);
	    config: RouteConfig;
	    matcher: RouteMatcherFunction | undefined;
	    reset(): void;
	    constructResponse(responseInput: RouteResponseConfig): {
	        response: Response;
	        responseOptions: ResponseInit;
	        responseInput: RouteResponseConfig;
	    };
	    constructResponseOptions(responseInput: RouteResponseConfig): ResponseInitUsingHeaders;
	    constructResponseBody(responseInput: RouteResponseConfig, responseOptions: ResponseInitUsingHeaders): string | null;
	    // TODO remove the ts ignores and regenerate
	    #private;
	}
	//Router
	export class Router {

	    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }?: {
	        routes?: Route[];
	        fallbackRoute?: Route;
	    });
	    routes: Route[];
	    config: import("./FetchMock").FetchMockConfig;
	    fallbackRoute: Route | void;
	    needsToReadBody(request: Request): boolean;
	    execute(callLog: CallLog): Promise<Response>;
	    generateResponse(callLog: CallLog): Promise<{
	        response: Response;
	        responseOptions: ResponseInit;
	        responseInput: RouteResponseConfig;
	    }>;
	    createObservableResponse(response: Response, responseConfig: ResponseInit, responseInput: RouteResponseConfig, responseUrl: string, pendingPromises: Promise<any>[]): Response;
	    addRoute(matcher: UserRouteConfig): void;
	    addRoute(matcher: RouteMatcher, response: RouteResponse, nameOrOptions?: UserRouteConfig | string): void;
	    setFallback(response?: RouteResponse): void;
	    removeRoutes({ names, includeSticky, includeFallback }?: {
	        names?: string[];
	        includeSticky?: boolean;
	        includeFallback?: boolean;
	    }): void;
	}
	type ResponseConfigProp = "body" | "headers" | "throws" | "status" | "redirectUrl";
	declare const statusTextMap: {
	    [x: number]: string;
	};
	export type DerivedRequestOptions = {
	    method: string;
	    body?: string;
	    headers?: {
	        [key: string]: string;
	    };
	};
	export type NormalizedRequestOptions = RequestInit | (RequestInit & DerivedRequestOptions);



}
