export class FetchMock {
    constructor(config: FetchMockConfig, router?: Router);
    config: FetchMockConfig;
    router: Router;
    callHistory: CallHistory;
    createInstance(): FetchMock;
    fetchHandler(this: FetchMock, requestInput: string | URL | Request, requestInit?: RequestInit): Promise<Response>;
    route(matcher: UserRouteConfig): FetchMock;
    route(matcher: RouteMatcher, response: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    catch(this: FetchMock, response?: RouteResponse): FetchMock;
    defineMatcher(matcher: MatcherDefinition): void;
    removeRoutes(options?: {
        names?: string[];
        includeSticky?: boolean;
        includeFallback?: boolean;
    }): this;
    clearHistory(this: FetchMock): FetchMock;
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
export default fetchMock;
export type RouteMatcher = import("./Router.js").RouteMatcher;
export type RouteName = import("./Route.js").RouteName;
export type UserRouteConfig = import("./Route.js").UserRouteConfig;
export type RouteResponse = import("./Router.js").RouteResponse;
export type MatcherDefinition = import("./Matchers.js").MatcherDefinition;
export type CallLog = import("./CallHistory.js").CallLog;
export type RouteResponseFunction = import("./Route.js").RouteResponseFunction;
export type FetchMockGlobalConfig = {
    sendAsJson?: boolean;
    includeContentLength?: boolean;
    matchPartialBody?: boolean;
};
export type FetchImplementations = {
    fetch?: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
    Headers?: typeof Headers;
    Request?: typeof Request;
    Response?: typeof Response;
};
export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;
import Router from './Router.js';
import CallHistory from './CallHistory.js';
declare const fetchMock: FetchMockStandalone;
declare class FetchMockStandalone extends FetchMock {
    mockGlobal(this: FetchMockStandalone): FetchMockStandalone;
    restoreGlobal(this: FetchMockStandalone): FetchMockStandalone;
    spy(this: FetchMockStandalone, matcher?: RouteMatcher | UserRouteConfig, name?: RouteName): FetchMockStandalone;
    createInstance(): FetchMockStandalone;
    #private;
}
