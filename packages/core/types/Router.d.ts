export default class Router {
    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }?: {
        routes?: Route[];
        fallbackRoute?: Route;
    });
    routes: Route[];
    config: import("./FetchMock.js").FetchMockConfig;
    fallbackRoute: Route;
    needsToReadBody(request: Request): boolean;
    execute(callLog: CallLog): Promise<Response>;
    generateResponse(callLog: CallLog): Promise<{
        response: Response;
        responseOptions: ResponseInit;
        responseInput: RouteResponseConfig;
    }>;
    createObservableResponse(response: Response, responseConfig: ResponseInit, responseInput: RouteResponseConfig, responseUrl: string, pendingPromises: Promise<any>[]): Response;
    addRoute(matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, nameOrOptions?: UserRouteConfig | string): void;
    setFallback(response?: RouteResponse): void;
    removeRoutes({ names, includeSticky, includeFallback }?: {
        names?: string[];
        includeSticky?: boolean;
        includeFallback?: boolean;
    }): void;
}
export type UserRouteConfig = import("./Route.js").UserRouteConfig;
export type RouteConfig = import("./Route.js").RouteConfig;
export type RouteResponse = import("./Route.js").RouteResponse;
export type RouteResponseData = import("./Route.js").RouteResponseData;
export type RouteResponseObjectData = import("./Route.js").RouteResponseObjectData;
export type RouteResponseConfig = import("./Route.js").RouteResponseConfig;
export type RouteResponseFunction = import("./Route.js").RouteResponseFunction;
export type RouteMatcher = import("./Matchers.ts").RouteMatcher;
export type FetchMockConfig = import("./FetchMock.js").FetchMockConfig;
export type FetchMock = typeof import("./FetchMock.js");
export type CallLog = import("./CallHistory.js").CallLog;
export type ResponseConfigProp = "body" | "headers" | "throws" | "status" | "redirectUrl";
import Route from './Route.js';
