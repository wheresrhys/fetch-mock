interface NormalizedRequestOptions {
    method: String;
    body?: Promise<String>;
    headers?: { [key: string]: string | [string] }
}
    
interface NormalizedRequest {
    url: String;
    options: RequestInit | (RequestInit & NormalizedRequestOptions);
    request?: Request;
    signal?: AbortSignal;
}