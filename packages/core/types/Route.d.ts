declare class Route {
    /**
     * @param {MatcherDefinition} matcher
     */
    static defineMatcher(matcher: any): void;
    /**
     * @overload
     * @param {RouteOptions} matcher
     * @param {undefined} response
     * @param {undefined} options
     * @param {FetchMockConfig} globalConfig
     */
    /**
     * @overload
     * @param {RouteMatcher } matcher
     * @param {RouteResponse} response
     * @param {RouteOptions | string} options
     * @param {FetchMockConfig} globalConfig
     */
    /**
     * @param {RouteMatcher | RouteOptions} matcher
     * @param {RouteResponse} [response]
     * @param {RouteOptions | string} [options]
     * @param {FetchMockConfig} [globalConfig]
     */
    constructor(matcher: any | any, response?: any, options?: any | string, globalConfig?: any);
    originalInput: {
        matcher: any;
        response: any;
        options: any;
    };
    routeOptions: RouteOptions;
    reset: () => void;
    response: () => Promise<any>;
    matcher: RouteMatcherFunction;
    #private;
}
declare namespace Route {
    export const registeredMatchers: any[];
}




/**
 * Mock options object
 */
interface RouteOptions {
    /**
     * A unique string naming the route. Used to subsequently retrieve
     * references to the calls, grouped by name.
     */
    name?: string;

    /**
     * http method to match
     */
    method?: string;

    /**
     * key/value map of headers to match
     */
    headers?: { [key: string]: string | number };

    /**
     * key/value map of query strings to match, in any order
     */
    query?: { [key: string]: string };

    /**
     * key/value map of express style path params to match
     */
    params?: { [key: string]: string };

    /**
     * JSON serialisable object literal. Allowing any object for now
     * But in typescript 3.7 will change to JSON
     */
    body?: object;

    /**
     * A function for arbitrary matching
     */
    functionMatcher?: RouteMatcherFunction;

    /**
     * as specified above
     */
    matcher?: RouteMatcher;

    url?: RouteMatcherUrl;

    /**
     * This option allows for existing routes in a mock to be overwritten.
     * It’s also possible to define multiple routes with ‘the same’ matcher.
     * Default behaviour is to error
     */
    overwriteRoutes?: boolean;

    /**
     * as specified above
     */
    response?: RouteResponse | RouteResponseFunction;

    /**
     * integer, n, limiting the number of times the matcher can be used.
     * If the route has already been called n times the route will be
     * ignored and the call to fetch() will fall through to be handled by
     * any other routes defined (which may eventually result in an error
     * if nothing matches it).
     */
    repeat?: number;

    /**
     * integer, n, delays responding for the number of milliseconds
     * specified.
     */
    delay?: number;

    /**
     * Convert objects into JSON before delivering as stub responses. Can
     * be useful to set to false globally if e.g. dealing with a lot of
     * array buffers. If true, will also add content-type: application/json
     * header.
     * @default true
     */
    sendAsJson?: boolean;

    /**
     * Automatically sets a content-length header on each response.
     * @default true
     */
    includeContentLength?: boolean;

    /**
     * Match calls that only partially match a specified body json.
     */
    matchPartialBody?: boolean;

    /**
     * Avoids a route being removed when reset(), restore() or resetBehavior() are called.
     * Note - this does not preserve the history of calls to the route
     */
    sticky?: boolean;
}