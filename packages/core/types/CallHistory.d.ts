export default CallHistory;
export type RouteConfig = import("./Route.js").UserRouteConfig & import("./FetchMock.js").FetchMockConfig;
export type RouteName = string;
export type NormalizedRequestOptions = RequestInit | (RequestInit & import("./RequestUtils.js").DerivedRequestOptions);
export type RouteMatcher = string | RegExp | URL | ((arg0: CallLog) => boolean);
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
export type CallLog = {
    arguments: any[];
    url: string;
    options: NormalizedRequestOptions;
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
export type Matched = "matched";
export type Unmatched = "unmatched";
export type CallHistoryFilter = string | boolean | RegExp | URL | ((arg0: CallLog) => boolean);
declare class CallHistory {
    /**
     * @param {FetchMockConfig} globalConfig
     * @param {Router} router
     */
    constructor(globalConfig: FetchMockConfig, router: Router);
    /** @type {CallLog[]} */
    callLogs: CallLog[];
    config: import("./FetchMock.js").FetchMockConfig;
    router: Router;
    /**
     *
     * @param {CallLog} callLog
     */
    recordCall(callLog: CallLog): void;
    clear(): void;
    /**
     *
     * @param {boolean} [waitForResponseMethods]
     * @returns {Promise<void>}
     */
    flush(waitForResponseMethods?: boolean): Promise<void>;
    /**
     *
     * @param {CallHistoryFilter} filter
     * @param {RouteConfig} options
     * @returns {CallLog[]}
     */
    calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[];
    /**
     *
     * @param {CallHistoryFilter} filter
     * @param {RouteConfig} options
     * @returns {boolean}
     */
    called(filter: CallHistoryFilter, options: RouteConfig): boolean;
    /**
     *
     * @param {CallHistoryFilter} filter
     * @param {RouteConfig} options
     * @returns {CallLog}
     */
    lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog;
    /**
     * @param {RouteName|RouteName[]} [routeNames]
     * @returns {boolean}
     */
    done(routeNames?: RouteName | RouteName[]): boolean;
}
import Route from "./Route.js";
import Router from "./Router.js";
