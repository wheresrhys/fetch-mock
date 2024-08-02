import { RouteConfig } from './Route.js';
import { CallLog } from './CallHistory.ts';
interface URLMatcherObject {
    begin?: string;
    end?: string;
    glob?: string;
    express?: string;
    path?: string;
    regexp?: RegExp;
}
type MatcherGenerator = (route: RouteConfig) => RouteMatcherFunction;
export type RouteMatcherUrl = string | RegExp | URL | URLMatcherObject;
export type RouteMatcherFunction = (callLog: CallLog) => boolean;
export type RouteMatcher = RouteMatcherUrl | RouteMatcherFunction;
export interface MatcherDefinition {
    name: string;
    matcher: MatcherGenerator;
    usesBody?: boolean;
}
export declare function isUrlMatcher(matcher: RouteMatcher | RouteConfig): matcher is RouteMatcherUrl;
export declare function isFunctionMatcher(matcher: RouteMatcher | RouteConfig): matcher is RouteMatcherFunction;
export declare const builtInMatchers: MatcherDefinition[];
export {};
