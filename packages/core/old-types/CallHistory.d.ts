export default FetchMock;
declare namespace FetchMock {
    export function filterCalls(nameOrMatcher: any, options: any): any;
    export function calls(nameOrMatcher: any, options: any): any;
    export function lastCall(nameOrMatcher: any, options: any): any;
    export function lastUrl(nameOrMatcher: any, options: any): any;
    export function lastOptions(nameOrMatcher: any, options: any): any;
    export function lastResponse(nameOrMatcher: any, options: any): any;
    export function called(nameOrMatcher: any, options: any): boolean;
    export function done(nameOrMatcher: any): any;
}

interface MockCall extends Array<string | RequestInit | undefined> {
    0: string;
    1: RequestInit | undefined;
    identifier: string;
    isUnmatched: boolean | undefined;
    request: Request | undefined;
    response: Response | undefined;
}


/**
 * Inspection filter. Can be one of the following:
 * boolean:
 *   * true retrieves all calls matched by fetch.
 *     fetchMock.MATCHED is an alias for true and may be used to make tests
 *     more readable.
 *   * false retrieves all calls not matched by fetch (i.e. those handled
 *     by catch() or spy(). fetchMock.UNMATCHED is an alias for false and
 *     may be used to make tests more readable.
 * MockMatcher (routeIdentifier):
 *   All routes have an identifier:
 *    * If it’s a named route, the identifier is the route’s name
 *    * If the route is unnamed, the identifier is the matcher passed in to
 *      .mock()
 *   All calls that were handled by the route with the given identifier
 *   will be retrieved
 * MockMatcher (matcher):
 *   Any matcher compatible with the mocking api can be passed in to filter
 *   the calls arbitrarily.
 */
type InspectionFilter = MockMatcher | boolean;

/**
 * Either an object compatible with the mocking api or a string specifying
 * a http method to filter by. This will be used to filter the list of
 * calls further.
 */
type InspectionOptions = MockOptions | string;



// /**
//  * Returns an array of all calls to fetch matching the given filters.
//  * Each call is returned as a [url, options] array. If fetch was called
//  * using a Request instance, this will be available as a request
//  * property on this array.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// calls(filter?: InspectionFilter, options?: InspectionOptions): MockCall[];

// /**
//  * Returns a Boolean indicating whether any calls to fetch matched the
//  * given filter.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// called(filter?: InspectionFilter, options?: InspectionOptions): boolean;

// /**
//  * Returns a Boolean indicating whether fetch was called the expected
//  * number of times (or has been called at least once if repeat is
//  * undefined for the route).
//  * @param [filter] Rule for matching calls to fetch.
//  */
// done(filter?: InspectionFilter): boolean;

// /**
//  * Returns the arguments for the last call to fetch matching the given
//  * filter.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// lastCall(
//     filter?: InspectionFilter,
//     options?: InspectionOptions,
// ): MockCall | undefined;

// /**
//  * Returns the url for the last call to fetch matching the given
//  * filter. If fetch was last called using a Request instance, the url
//  * will be extracted from this.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// lastUrl(
//     filter?: InspectionFilter,
//     options?: InspectionOptions,
// ): string | undefined;

// /**
//  * Returns the options for the call to fetch matching the given filter.
//  * If fetch was last called using a Request instance, a set of options
//  * inferred from the Request will be returned.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// lastOptions(
//     filter?: InspectionFilter,
//     options?: InspectionOptions,
// ): MockOptions | undefined;

// /**
//  * Returns the options for the call to fetch matching the given filter.
//  * This is an experimental feature, very difficult to implement well given
//  * fetch’s very private treatment of response bodies.
//  * When doing all the following:
//    -  using node-fetch
//    -  responding with a real network response (using spy() or fallbackToNetwork)
//    -  using `fetchMock.LastResponse()`
//    -  awaiting the body content
//        … the response will hang unless your source code also awaits the response body.
//        This is an unavoidable consequence of the nodejs implementation of streams.
//  * @param [filter] Allows filtering of calls to fetch based on various
//  * criteria
//  * @param [options] Either an object compatible with the mocking api or
//  * a string specifying a http method to filter by. This will be used to
//  * filter the list of calls further.
//  */
// lastResponse(
//     filter?: InspectionFilter,
//     options?: InspectionOptions,
// ): Response | undefined;

