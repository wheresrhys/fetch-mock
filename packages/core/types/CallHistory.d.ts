export default CallHistory;
export type Matched = "matched";
export type Unmatched = "unmatched";
export type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;
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
}

declare class CallHistory {
    constructor(globalConfig: FetchMockConfig, router: Router);
    callLogs: CallLog[];
    config: any;
    router: Router;
    recordCall(callLog: CallLog): void;
    clear(): void;
    flush(waitForResponseMethods?: boolean): Promise<void>;
    calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[];
    called(filter: CallHistoryFilter, options: RouteConfig): boolean;
    lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog;
    done(routeNames?: RouteName | RouteName[]): boolean;
}

export default CallHistory