export default Route;
declare class Route {
    /**
     * @param {MatcherDefinition} matcher
     */
    static defineMatcher(matcher: any): void;
    /**
     * @overload
     * @param {MockOptions} matcher
     * @param {undefined} response
     * @param {undefined} options
     * @param {FetchMockConfig} globalConfig
     */
    /**
     * @overload
     * @param {MockMatcher } matcher
     * @param {MockResponse} response
     * @param {MockOptions | string} options
     * @param {FetchMockConfig} globalConfig
     */
    /**
     * @param {MockMatcher | MockOptions} matcher
     * @param {MockResponse} [response]
     * @param {MockOptions | string} [options]
     * @param {FetchMockConfig} [globalConfig]
     */
    constructor(matcher: any | any, response?: any, options?: any | string, globalConfig?: any);
    originalInput: {
        matcher: any;
        response: any;
        options: any;
    };
    method: any;
    url: (url: any, options: {}, request: any) => boolean;
    functionMatcher: any;
    usesBody: boolean;
    matcher: (url: any, options: {}, request: any) => boolean;
    reset: () => void;
    response: () => Promise<any>;
    #private;
}
declare namespace Route {
    export const registeredMatchers: any[];
}
