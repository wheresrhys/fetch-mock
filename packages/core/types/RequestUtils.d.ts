interface DerivedRequestOptions {
    method: string;
    body?: Promise<string>;
    headers?: { [key: string]: string | [string] }
}
type NormalizedRequestOptions = RequestInit | (RequestInit & DerivedRequestOptions)
interface NormalizedRequest {
    url: string;
    options: NormalizedRequestOptions;
    request?: Request;
    signal?: AbortSignal;
}