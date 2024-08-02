import Router from './Router.js';
import { RouteName, UserRouteConfig, RouteResponse } from './Route.ts';
import CallHistory from './CallHistory.ts';
import { MatcherDefinition, RouteMatcher } from './Matchers.ts';
export interface FetchMockGlobalConfig {
    sendAsJson?: boolean;
    includeContentLength?: boolean;
    matchPartialBody?: boolean;
}
export interface FetchImplementations {
    fetch?: typeof fetch;
    Headers?: typeof Headers;
    Request?: typeof Request;
    Response?: typeof Response;
}
export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;
export declare class FetchMock {
    config: FetchMockConfig;
    router: Router;
    callHistory: CallHistory;
    constructor(config: FetchMockConfig, router?: Router);
    createInstance(): FetchMock;
    fetchHandler(requestInput: string | URL | Request, requestInit?: RequestInit): Promise<Response>;
    route(matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string): FetchMock;
    catch(response: RouteResponse): FetchMock;
    defineMatcher(matcher: MatcherDefinition): void;
    removeRoutes(options?: {
        names?: string[];
        includeSticky?: boolean;
        includeFallback?: boolean;
    }): FetchMock;
    clearHistory(): FetchMock;
    sticky: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    once: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    any: (this: FetchMock, response: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    anyOnce: (this: FetchMock, response: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    get: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    getOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    post: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    postOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    put: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    putOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    delete: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    deleteOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    head: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    headOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    patch: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
    patchOnce: (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) => FetchMock;
}
declare class FetchMockStandalone extends FetchMock {
    mockGlobal(): FetchMockStandalone;
    unmockGlobal(): FetchMockStandalone;
    spy(matcher?: RouteMatcher | UserRouteConfig, name?: RouteName): FetchMockStandalone;
    spyGlobal(): FetchMockStandalone;
    createInstance(): FetchMockStandalone;
}
declare const fetchMock: FetchMockStandalone;
export default fetchMock;
