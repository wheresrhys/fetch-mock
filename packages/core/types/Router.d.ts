export default class Router {
    /**
     * @param {FetchMockConfig} fetchMockConfig
     * @param {object} [inheritedRoutes]
     * @param {Route[]} [inheritedRoutes.routes]
     * @param {Route} [inheritedRoutes.fallbackRoute]
     */
    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }?: {
        routes: Route[];
        fallbackRoute: Route;
    });
    /** @type {Route[]} */
    routes: Route[];
    config: import("./FetchMock.js").FetchMockConfig;
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
    /**
     * @overload
     * @param {RouteMatcher } matcher
     * @param {RouteResponse} response
     * @param {UserRouteConfig | string} [nameOrOptions]
     * @returns {void}
     */
    /**
     * @param {RouteMatcher | UserRouteConfig} matcher
     * @param {RouteResponse} [response]
     * @param {UserRouteConfig | string} [nameOrOptions]
     * @returns {void}
     */
    addRoute(matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, nameOrOptions?: UserRouteConfig | string): void;
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
        names: string[];
        includeSticky: boolean;
        includeFallback: boolean;
    }): void;
}
export type UserRouteConfig = {
    name?: string;
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
    matcherFunction?: (arg0: import("./CallHistory.js").CallLog) => boolean;
    matcher?: string | RegExp | URL | ((arg0: import("./CallHistory.js").CallLog) => boolean);
    url?: string | RegExp | URL;
    response?: string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig> | ((arg0: import("./CallHistory.js").CallLog) => string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig>);
    repeat?: number;
    delay?: number;
    /**
     * - TODO this is global
     */
    sendAsJson?: boolean;
    /**
     * - TODO this is global
     */
    includeContentLength?: boolean;
    /**
     * - TODO this is global
     */
    matchPartialBody?: boolean;
    sticky?: boolean;
    /**
     * - TODO this shoudl not be in user config
     */
    usesBody?: boolean;
    isFallback?: boolean;
};
export type RouteConfig = import("./Route.js").UserRouteConfig & import("./FetchMock.js").FetchMockConfig;
export type RouteResponse = string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig> | ((arg0: import("./CallHistory.js").CallLog) => string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig>);
export type RouteResponseData = string | number | object | Response | import("./Route.js").RouteResponseConfig;
export type RouteResponseObjectData = object | import("./Route.js").RouteResponseConfig;
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
export type RouteResponseFunction = (arg0: import("./CallHistory.js").CallLog) => string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig>;
export type RouteMatcher = string | RegExp | URL | ((arg0: import("./CallHistory.js").CallLog) => boolean);
export type FetchMockConfig = {
    sendAsJson?: boolean;
    includeContentLength?: boolean;
    warnOnFallback?: boolean;
    matchPartialBody?: boolean;
    fetch?: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
    Headers?: {
        new (init?: HeadersInit): Headers;
        prototype: Headers;
    };
    Request?: {
        new (input: string | Request, init?: RequestInit): Request;
        prototype: Request;
    };
    Response?: {
        new (body?: BodyInit, init?: ResponseInit): Response;
        prototype: Response;
        error(): Response;
        redirect(url: string, status?: number): Response;
    };
};
export type FetchMock = typeof import("./FetchMock.js");
export type CallLog = {
    arguments: any[];
    url: string;
    options: RequestInit | (RequestInit & import("./RequestUtils.js").DerivedRequestOptions);
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
};
export type ResponseConfigProp = "body" | "headers" | "throws" | "status" | "redirectUrl";
import Route from "./Route.js";
