import { NormalizedRequestOptions } from './RequestUtils.ts';
import { RouteMatcher } from './Matchers.ts';
import { FetchMockConfig } from './FetchMock.ts';
import Route, { RouteName, RouteConfig } from './Route.ts';
import Router from './Router.js';
export interface CallLog {
    args: any[];
    url: string;
    options: NormalizedRequestOptions;
    request?: Request;
    signal?: AbortSignal;
    route?: Route;
    response?: Response;
    expressParams?: {
        [key: string]: string;
    };
    queryParams?: URLSearchParams;
    pendingPromises: Promise<any>[];
}
type Matched = 'matched';
type Unmatched = 'unmatched';
type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;
declare class CallHistory {
    callLogs: CallLog[];
    config: FetchMockConfig;
    router: Router;
    constructor(config: FetchMockConfig, router: Router);
    recordCall(callLog: CallLog): void;
    clear(): void;
    flush(waitForResponseMethods?: boolean): Promise<void>;
    calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[];
    called(filter: CallHistoryFilter, options: RouteConfig): boolean;
    lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog;
    done(routeNames?: RouteName | RouteName[]): boolean;
}
export default CallHistory;
