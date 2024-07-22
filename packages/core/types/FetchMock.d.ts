declare var _default: any;
export default _default;
export type RouteMatcher = string | RegExp | URL | ((arg0: import("./CallHistory.js").CallLog) => boolean);
export type RouteName = string;
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
export type RouteResponse = string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig> | ((arg0: import("./CallHistory.js").CallLog) => string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig>);
export type MatcherDefinition = {
    name: string;
    matcher: (arg0: import("./Route.js").UserRouteConfig & FetchMockConfig) => (arg0: import("./CallHistory.js").CallLog) => boolean;
    usesBody?: boolean;
};
export type CallLog = {
    arguments: any[];
    url: string;
    options: RequestInit | (RequestInit & requestUtils.DerivedRequestOptions);
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
export type RouteResponseFunction = (arg0: import("./CallHistory.js").CallLog) => string | number | object | Response | import("./Route.js").RouteResponseConfig | Promise<string | number | object | Response | import("./Route.js").RouteResponseConfig>;
export type FetchMockConfig = {
    sendAsJson?: boolean;
    includeContentLength?: boolean;
    warnOnFallback?: boolean;
    matchPartialBody?: boolean;
    fetch?: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
    Headers?: typeof Headers;
    Request?: typeof Request;
    Response?: typeof Response;
};
export type FetchMockCore = {
    config: FetchMockConfig;
    router: Router;
    callHistory: CallHistory;
    createInstance: () => FetchMock;
    fetchHandler: (arg0: string | Request, arg1: RequestInit) => Promise<Response>;
    route: (arg0: any, arg1: any, arg2: any) => FetchMock;
    catch: (arg0: RouteResponse | undefined) => FetchMock;
    defineMatcher: (arg0: MatcherDefinition) => void;
    removeRoutes: (arg0: object) => void;
    clearHistory: () => void;
};
/**
 * }
 */
export type PresetRouteMethodName = "sticky" | "get" | "post" | "put" | "delete" | "head" | "patch" | "once" | "any" | "anyOnce" | "getOnce" | "postOnce" | "putOnce" | "deleteOnce" | "headOnce" | "patchOnce" | "getAny" | "postAny" | "putAny" | "deleteAny" | "headAny" | "patchAny" | "getAnyOnce" | "postAnyOnce" | "putAnyOnce" | "deleteAnyOnce" | "headAnyOnce" | "patchAnyOnce";
export type PresetRoutes = any;
export type FetchMock = any;
import * as requestUtils from "./RequestUtils.js";
import Route from "./Route.js";
import Router from "./Router.js";
import CallHistory from "./CallHistory.js";
/**
 * @type {FetchMockCore}
 * @this {FetchMock}
 * */
declare const FetchMock: FetchMockCore;
