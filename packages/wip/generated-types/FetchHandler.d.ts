export default FetchHandler;
/**
 * An object that contains the fetch handler function - used as the mock for
 * fetch - and various utilities to help it operate
 * This object will never be accessed as a separate entity by the end user as it
 * gets munged with Router and CallHistory objects by FetchMockWrapper
 */
export type FetchHandler = any;
declare namespace FetchHandler {
    export function fetchHandler(url: any, options: any): Promise<any>;
    export namespace fetchHandler {
        export const isMock: boolean;
    }
    export function generateResponse({ route, url, options, request, callLog, }: {
        route: any;
    }): Promise<any>;
}
