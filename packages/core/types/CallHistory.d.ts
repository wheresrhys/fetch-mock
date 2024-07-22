export default CallHistory;
export type RouteConfig = import("./Route").RouteConfig;
export type RouteName = import("./Route").RouteName;
export type NormalizedRequestOptions = import("./RequestUtils").NormalizedRequestOptions;
export type RouteMatcher = import("./Matchers").RouteMatcher;
export type FetchMockConfig = import("./FetchMock").FetchMockConfig;
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
export type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;
declare class CallHistory {
    /**
     * @param {FetchMockConfig} globalConfig
     * @param {Router} router
     */
    constructor(globalConfig: FetchMockConfig, router: Router);
    /** @type {CallLog[]} */
    callLogs: CallLog[];
    config: import("./FetchMock").FetchMockConfig;
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
import Route from './Route.js';
import Router from './Router.js';
//# sourceMappingURL=CallHistory.d.ts.map