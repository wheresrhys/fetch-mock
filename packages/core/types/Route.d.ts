import { CallLog } from './CallHistory.ts';
import { FetchMockGlobalConfig, FetchImplementations } from './FetchMock.ts';
import { RouteMatcherFunction, RouteMatcherUrl, MatcherDefinition } from './Matchers.ts';
export interface UserRouteSpecificConfig {
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
    url?: RouteMatcherUrl;
    response?: RouteResponse | RouteResponseFunction;
    repeat?: number;
    delay?: number;
    sticky?: boolean;
}
interface InternalRouteConfig {
    usesBody?: boolean;
    isFallback?: boolean;
}
export type UserRouteConfig = UserRouteSpecificConfig & FetchMockGlobalConfig;
export type RouteConfig = UserRouteConfig & FetchImplementations & InternalRouteConfig;
export interface RouteResponseConfig {
    body?: string | {};
    status?: number;
    headers?: {
        [key: string]: string;
    };
    throws?: Error;
    redirectUrl?: string;
    options?: ResponseInit;
}
interface ResponseInitUsingHeaders {
    status: number;
    statusText: string;
    headers: Headers;
}
export type RouteResponseObjectData = RouteResponseConfig | object;
export type RouteResponseData = Response | number | string | RouteResponseObjectData;
type RouteResponsePromise = Promise<RouteResponseData>;
export type RouteResponseFunction = (callLog: CallLog) => RouteResponseData | RouteResponsePromise;
export type RouteResponse = RouteResponseData | RouteResponsePromise | RouteResponseFunction;
export type RouteName = string;
declare class Route {
    #private;
    config: RouteConfig;
    matcher: RouteMatcherFunction | null;
    constructor(config: RouteConfig);
    reset(): void;
    constructResponse(responseInput: RouteResponseConfig): {
        response: Response;
        responseOptions: ResponseInit;
        responseInput: RouteResponseConfig;
    };
    constructResponseOptions(responseInput: RouteResponseConfig): ResponseInitUsingHeaders;
    constructResponseBody(responseInput: RouteResponseConfig, responseOptions: ResponseInitUsingHeaders): string | null;
    static defineMatcher(matcher: MatcherDefinition): void;
    static registeredMatchers: MatcherDefinition[];
}
export default Route;
