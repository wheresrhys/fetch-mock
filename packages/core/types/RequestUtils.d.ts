/**
 * @typedef DerivedRequestOptions
 * @property  {string} method
 * @property  {string} [body]
 * @property  {{ [key: string]: string }} [headers]
 */
/** @typedef {RequestInit | (RequestInit & DerivedRequestOptions) } NormalizedRequestOptions */
/** @typedef {import('./CallHistory').CallLog} CallLog */
/**
 * @param {string | string | URL} url
 * @returns {string}
 */
export function normalizeUrl(url: string | string | URL): string;
/**
 *
 * @param {string | object} url
 * @param {RequestInit} options
 * @returns {CallLog}
 */
export function createCallLogFromUrlAndOptions(url: string | object, options: RequestInit): CallLog;
/**
 *
 * @param {Request} request
 * @param {RequestInit} options
 * @returns {Promise<CallLog>}
 */
export function createCallLogFromRequest(request: Request, options: RequestInit): Promise<CallLog>;
/**
 * @param {string} url
 * @returns {string}
 */
export function getPath(url: string): string;
/**
 * @param {string} url
 * @returns {string}
 */
export function getQuery(url: string): string;
export function isRequest(urlOrRequest: string | Request, Request: typeof Request): urlOrRequest is Request;
export function normalizeHeaders(headers: Headers | [string, string][] | Record<string, string> | {
    [x: string]: string | number;
}): {
    [x: string]: string;
};
export type DerivedRequestOptions = {
    method: string;
    body?: string;
    headers?: {
        [key: string]: string;
    };
};
export type NormalizedRequestOptions = RequestInit | (RequestInit & DerivedRequestOptions);
export type CallLog = {
    arguments: any[];
    url: string;
    options: RequestInit | (RequestInit & DerivedRequestOptions);
    request?: Request;
    signal?: AbortSignal;
    route?: import("./Route").default;
    response?: Response;
    expressParams?: {
        [x: string]: string;
    };
    queryParams?: {
        [x: string]: string;
    };
    pendingPromises: Promise<any>[];
};
