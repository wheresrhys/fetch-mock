export default fetchMock;
export type RouteMatcher = import("./Router").RouteMatcher;
export type RouteName = import("./Route").RouteName;
export type UserRouteConfig = import("./Route").UserRouteConfig;
export type RouteResponse = import("./Router").RouteResponse;
export type MatcherDefinition = import("./Matchers").MatcherDefinition;
export type CallLog = import("./CallHistory").CallLog;
export type RouteResponseFunction = import("./Route").RouteResponseFunction;
export type FetchMockGlobalConfig = {
    sendAsJson?: boolean;
    includeContentLength?: boolean;
    warnOnFallback?: boolean;
    matchPartialBody?: boolean;
};
export type FetchImplementations = {
    fetch?: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
    Headers?: typeof Headers;
    Request?: typeof Request;
    Response?: typeof Response;
};
export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;
declare const fetchMock: FetchMock;
declare class FetchMock {
    constructor(config: FetchMockConfig, router?: Router);
    config: FetchMockConfig;
    router: Router;
    callHistory: CallHistory;
    createInstance(): FetchMock;
    fetchHandler(this: FetchMock, requestInput: string | Request, requestInit?: RequestInit): Promise<Response>;
    route(matcher: UserRouteConfig): FetchMock;
    route(matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    catch(this: FetchMock, response?: RouteResponse): FetchMock;
    defineMatcher(matcher: MatcherDefinition): void;
    removeRoutes(options?: {
        names?: string[];
        includeSticky?: boolean;
        includeFallback?: boolean;
    }): FetchMock;
    clearHistory(): FetchMock;
    sticky: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    once: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    any: (this: FetchMock, response: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    anyOnce: (this: FetchMock, response: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    get: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    getOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    post: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    postOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    put: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    putOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    delete: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    deleteOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    head: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    headOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    patch: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
    patchOnce: {
        (this: FetchMock, matcher: UserRouteConfig): FetchMock;
        (this: FetchMock, matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    };
}
import Router from './Router.js';
import CallHistory from './CallHistory.js';
