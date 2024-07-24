export function normalizeUrl(url: string | string | URL): string;
export function createCallLogFromUrlAndOptions(url: string | object, options: RequestInit): CallLog;
export function createCallLogFromRequest(request: Request, options: RequestInit): Promise<CallLog>;
export function getPath(url: string): string;
export function getQuery(url: string): string;
export function normalizeHeaders(headers: Headers | [string, string][] | Record<string, string> | {
    [x: string]: string | number;
} | HeadersInit): {
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
export type CallLog = import("./CallHistory.js").CallLog;
