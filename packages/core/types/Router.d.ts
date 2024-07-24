export default class Router {
    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }?: {
        routes?: Route[];
        fallbackRoute?: Route;
    });
    routes: Route[];
    config: import("./FetchMock").FetchMockConfig;
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
export type UserRouteConfig = import("./Route").UserRouteConfig;
export type RouteConfig = import("./Route").RouteConfig;
export type RouteResponse = import("./Route").RouteResponse;
export type RouteResponseData = import("./Route").RouteResponseData;
export type RouteResponseObjectData = import("./Route").RouteResponseObjectData;
export type RouteResponseConfig = import("./Route").RouteResponseConfig;
export type RouteResponseFunction = import("./Route").RouteResponseFunction;
export type RouteMatcher = import("./Matchers").RouteMatcher;
export type FetchMockConfig = import("./FetchMock").FetchMockConfig;
export type FetchMock = typeof import("./FetchMock");
export type CallLog = import("./CallHistory").CallLog;
export type ResponseConfigProp = "body" | "headers" | "throws" | "status" | "redirectUrl";
import Route from './Route.js';
