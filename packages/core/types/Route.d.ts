export default Route;
export type RouteMatcher = string | RegExp | URL | ((arg0: import("./CallHistory").CallLog) => boolean);
export type CallLog = {
    arguments: any[];
    url: string;
    options: RequestInit | (RequestInit & import("./RequestUtils").DerivedRequestOptions);
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
export type RouteMatcherFunction = (arg0: import("./CallHistory").CallLog) => boolean;
export type RouteMatcherUrl = string | RegExp | URL;
export type MatcherDefinition = {
    name: string;
    matcher: (arg0: UserRouteConfig & import("./FetchMock").FetchMockConfig) => (arg0: import("./CallHistory").CallLog) => boolean;
    usesBody?: boolean;
};
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
/**
 * {
 */
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
export type ResponseInitUsingHeaders = {
    status: number;
    statusText: string;
    headers: Headers;
};
export type RouteResponseObjectData = object | RouteResponseConfig;
export type RouteResponseData = string | number | object | Response | RouteResponseConfig;
export type RouteResponsePromise = Promise<string | number | object | Response | RouteResponseConfig>;
export type RouteResponseFunction = (arg0: CallLog) => (RouteResponseData | RouteResponsePromise);
export type RouteResponse = string | number | object | Response | RouteResponseConfig | Promise<string | number | object | Response | RouteResponseConfig> | ((arg0: CallLog) => (RouteResponseData | RouteResponsePromise));
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
export type RouteConfig = UserRouteConfig & import("./FetchMock").FetchMockConfig;
/**
 * @class Route
 */
declare class Route {
    /**
     * @param {MatcherDefinition} matcher
     */
    static defineMatcher(matcher: MatcherDefinition): void;
    /** @type {MatcherDefinition[]} */
    static registeredMatchers: MatcherDefinition[];
    /**
     * @param {RouteConfig} config
     */
    constructor(config: RouteConfig);
    /** @type {RouteConfig} */
    config: RouteConfig;
    /** @type {RouteMatcherFunction=} */
    matcher: RouteMatcherFunction | undefined;
    /**
     * @returns {void}
     */
    reset(): void;
    /**
     *
     * @param {RouteResponseConfig} responseInput
     * @returns {{response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig}}
     */
    constructResponse(responseInput: RouteResponseConfig): {
        response: Response;
        responseOptions: ResponseInit;
        responseInput: RouteResponseConfig;
    };
    /**
     *
     * @param {RouteResponseConfig} responseInput
     * @returns {ResponseInitUsingHeaders}
     */
    constructResponseOptions(responseInput: RouteResponseConfig): ResponseInitUsingHeaders;
    /**
     *
     * @param {RouteResponseConfig} responseInput
     * @param {ResponseInitUsingHeaders} responseOptions
     * @returns {string|null}
     */
    constructResponseBody(responseInput: RouteResponseConfig, responseOptions: ResponseInitUsingHeaders): string | null;
    #private;
}
