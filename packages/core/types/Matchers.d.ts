export function isUrlMatcher(matcher: RouteMatcher | RouteConfig): matcher is string | RegExp | URL;
export function isFunctionMatcher(matcher: RouteMatcher | RouteConfig): matcher is (arg0: CallLog) => boolean;
/** @type {MatcherDefinition[]} */
export const builtInMatchers: MatcherDefinition[];
export type RouteConfig = import("./Route.js").UserRouteConfig & import("./FetchMock.js").FetchMockConfig;
export type CallLog = {
    arguments: any[];
    url: string;
    options: RequestInit | (RequestInit & import("./RequestUtils.js").DerivedRequestOptions);
    request?: Request;
    signal?: AbortSignal;
    route?: import("./Route.js").default;
    response?: Response;
    expressParams?: {
        [x: string]: string;
    };
    queryParams?: {
        [x: string]: string;
    };
    pendingPromises: Promise<any>[];
};
export type RouteMatcherUrl = string | RegExp | URL;
export type UrlMatcherGenerator = (arg0: string) => RouteMatcherFunction;
export type RouteMatcherFunction = (arg0: CallLog) => boolean;
export type MatcherGenerator = (arg0: RouteConfig) => RouteMatcherFunction;
export type RouteMatcher = string | RegExp | URL | ((arg0: CallLog) => boolean);
export type MatcherDefinition = {
    name: string;
    matcher: MatcherGenerator;
    usesBody?: boolean;
};
