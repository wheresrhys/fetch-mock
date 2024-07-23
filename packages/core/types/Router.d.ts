export default class Router {
    /**
     * @param {FetchMockConfig} fetchMockConfig
     * @param {object} [inheritedRoutes]
     * @param {Route[]} [inheritedRoutes.routes]
     * @param {Route} [inheritedRoutes.fallbackRoute]
     */
    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }?: {
        routes?: Route[];
        fallbackRoute?: Route;
    });
    /** @type {Route[]} */
    routes: Route[];
    config: import("./FetchMock").FetchMockConfig;
    fallbackRoute: Route;
    /**
     *
     * @param {Request} request
     * @returns {boolean}
     */
    needsToReadBody(request: Request): boolean;
    /**
     * @param {CallLog} callLog
     * @returns {Promise<Response>}
     */
    execute(callLog: CallLog): Promise<Response>;
    /**
     *
     * @param {CallLog} callLog
     * @returns {Promise<{response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig}>}
     */
    generateResponse(callLog: CallLog): Promise<{
        response: Response;
        responseOptions: ResponseInit;
        responseInput: RouteResponseConfig;
    }>;
    /**
     *
     * @param {Response} response
     * @param {ResponseInit} responseConfig
     * @param {RouteResponseConfig} responseInput
     * @param {string} responseUrl
     * @param {Promise<any>[]} pendingPromises
     * @returns {Response}
     */
    createObservableResponse(response: Response, responseConfig: ResponseInit, responseInput: RouteResponseConfig, responseUrl: string, pendingPromises: Promise<any>[]): Response;
    /**
     * @overload
     * @param {UserRouteConfig} matcher
     * @returns {void}
     */
    addRoute(matcher: UserRouteConfig): void;
    /**
     * @overload
     * @param {RouteMatcher } matcher
     * @param {RouteResponse} response
     * @param {UserRouteConfig | string} [nameOrOptions]
     * @returns {void}
     */
    addRoute(matcher: RouteMatcher, response: RouteResponse, nameOrOptions?: UserRouteConfig | string): void;
    /**
     * @param {RouteResponse} [response]
     */
    setFallback(response?: RouteResponse): void;
    /**
     *
     * @param {object} [options]
     * @param {string[]} [options.names]
     * @param {boolean} [options.includeSticky]
     * @param {boolean} [options.includeFallback]
     */
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
