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
