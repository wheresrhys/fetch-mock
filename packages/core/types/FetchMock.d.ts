declare const _default: any;
export default _default;
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

// TODO distinguish between different methods's signatures here
export type PresetRouteMethodName = "get" | "post" | "put" | "delete" | "head" | "patch" | "once" | "sticky" | "any" | "anyOnce" | "getOnce" | "postOnce" | "putOnce" | "deleteOnce" | "headOnce" | "patchOnce" | "getAny" | "postAny" | "putAny" | "deleteAny" | "headAny" | "patchAny" | "getAnyOnce" | "postAnyOnce" | "putAnyOnce" | "deleteAnyOnce" | "headAnyOnce" | "patchAnyOnce";
export type PresetRoutes = {
    [x: PresetRouteMethodName]: (any, any, any) => FetchMock;
}
export type FetchMock = FetchMockCore & PresetRoutes;