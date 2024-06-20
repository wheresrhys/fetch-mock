export function normalizeUrl(url: any): any;
/**
 *
 * @param {string|Request} urlOrRequest
 * @param {Object} options
 * @param {Class} Request
 * @returns
 */
export function normalizeRequest(urlOrRequest: string | Request, options: Object, Request: any): {
    url: any;
    options: {
        method: any;
    } & Object;
    request: RequestInfo;
    signal: any;
} | {
    url: any;
    options: Object;
    signal: any;
};
export function getPath(url: any): string;
export function getQuery(url: any): string;
export namespace headers {
    export function normalize(headers: any): any;
    export function toLowerCase(headers: any): {};
    export function equal(actualHeader: any, expectedHeader: any): any;
}
