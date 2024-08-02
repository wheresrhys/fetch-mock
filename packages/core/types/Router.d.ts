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
    addRoute(matcher: RouteMatcher | UserRouteSpecificConfig, response?: RouteResponse, nameOrOptions?: UserRouteSpecificConfig | string): void;
    setFallback(response?: RouteResponse): void;
    removeRoutes({ names, includeSticky, includeFallback }?: {
        names?: string[];
        includeSticky?: boolean;
        includeFallback?: boolean;
    }): void;
}
export type UserRouteSpecificConfig = import("./Route.ts").UserRouteSpecificConfig;
export type RouteConfig = import("./Route.ts").RouteConfig;
export type RouteResponse = import("./Route.ts").RouteResponse;
export type RouteResponseData = import("./Route.ts").RouteResponseData;
export type RouteResponseObjectData = import("./Route.ts").RouteResponseObjectData;
export type RouteResponseConfig = import("./Route.ts").RouteResponseConfig;
export type RouteResponseFunction = import("./Route.ts").RouteResponseFunction;
export type RouteMatcher = import("./Matchers.ts").RouteMatcher;
export type FetchMockConfig = import("./FetchMock.js").FetchMockConfig;
export type FetchMock = typeof import("./FetchMock.js");
export type CallLog = import("./CallHistory.js").CallLog;
export type ResponseConfigProp = "body" | "headers" | "throws" | "status" | "redirectUrl";
import Route from './Route.ts';
