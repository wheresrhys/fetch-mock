export default Route;
export type RouteMatcher = import("./Matchers").RouteMatcher;
export type CallLog = import("./CallHistory").CallLog;
export type RouteMatcherFunction = import("./Matchers").RouteMatcherFunction;
export type RouteMatcherUrl = import("./Matchers").RouteMatcherUrl;
export type MatcherDefinition = import("./Matchers").MatcherDefinition;
export type FetchMockConfig = import("./FetchMock").FetchMockConfig;
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
export type RouteResponseObjectData = RouteResponseConfig | object;
export type RouteResponseData = Response | number | string | RouteResponseObjectData;
export type RouteResponsePromise = Promise<RouteResponseData>;
export type RouteResponseFunction = (arg0: CallLog) => (RouteResponseData | RouteResponsePromise);
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
export type RouteConfig = UserRouteConfig & FetchMockConfig;
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
//# sourceMappingURL=Route.d.ts.map