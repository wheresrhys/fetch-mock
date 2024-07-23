declare const _default: any;
export default _default;
export type RouteMatcher = import("./Router").RouteMatcher;
export type RouteName = import("./Route").RouteName;
export type UserRouteConfig = import("./Route").UserRouteConfig;
export type RouteResponse = import("./Router").RouteResponse;
export type MatcherDefinition = import("./Matchers").MatcherDefinition;
export type CallLog = import("./CallHistory").CallLog;
export type RouteResponseFunction = import("./Route").RouteResponseFunction;
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
export type PresetRouteMethodName = "get" | "post" | "put" | "delete" | "head" | "patch" | "once" | "sticky" | "any" | "anyOnce" | "getOnce" | "postOnce" | "putOnce" | "deleteOnce" | "headOnce" | "patchOnce" | "getAny" | "postAny" | "putAny" | "deleteAny" | "headAny" | "patchAny" | "getAnyOnce" | "postAnyOnce" | "putAnyOnce" | "deleteAnyOnce" | "headAnyOnce" | "patchAnyOnce";
export type PresetRoutes = any;
export type FetchMock = FetchMockCore & PresetRoutes;
import Router from './Router.js';
import CallHistory from './CallHistory.js';
