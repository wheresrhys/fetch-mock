const absoluteUrlRX: RegExp = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX: RegExp = new RegExp('^//', 'i');

interface DerivedRequestOptions {
  method: string;
  body?: string;
  headers?: { [key: string]: string };
}

export type NormalizedRequestOptions = RequestInit | (RequestInit & DerivedRequestOptions);
import { CallLog } from './CallHistory.js';

export function normalizeUrl(url: string | string | URL): string {
  if (url instanceof URL) {
    return url.href;
  }
  if (absoluteUrlRX.test(url)) {
    return new URL(url).href;
  }
  if (protocolRelativeUrlRX.test(url)) {
    return new URL(url, 'http://dummy').href;
  }
  const u = new URL(url, 'http://dummy');
  return u.pathname + u.search;
}

export function createCallLogFromUrlAndOptions(url: string | object, options: RequestInit): CallLog {
  const pendingPromises: Promise<any>[] = [];
  if (typeof url === 'string' || url instanceof String || url instanceof URL) {
    // @ts-ignore - jsdoc doesn't distinguish between string and String, but typechecker complains
    url = normalizeUrl(url);
    const derivedOptions = options ? { ...options } : {};
    if (derivedOptions.headers) {
      derivedOptions.headers = normalizeHeaders(derivedOptions.headers);
    }
    derivedOptions.method = derivedOptions.method
      ? derivedOptions.method.toLowerCase()
      : 'get';
    return {
      args: [url, options],
      url,
      queryParams: new URLSearchParams(getQuery(url)),
      options: derivedOptions,
      signal: derivedOptions.signal,
      pendingPromises,
    };
  }
  if (typeof url === 'object') {
    throw new TypeError(
      'fetch-mock: Unrecognised Request object. Read the Config and Installation sections of the docs',
    );
  } else {
    throw new TypeError('fetch-mock: Invalid arguments passed to fetch');
  }
}

export async function createCallLogFromRequest(request: Request, options: RequestInit): Promise<CallLog> {
  const pendingPromises: Promise<any>[] = [];
  const derivedOptions: NormalizedRequestOptions = {
    method: request.method,
  };

  try {
    derivedOptions.body = await request.clone().text();
  } catch (err) {}

  if (request.headers) {
    derivedOptions.headers = normalizeHeaders(request.headers);
  }
  const url = normalizeUrl(request.url);
  const callLog = {
    args: [request, options],
    url,
    queryParams: new URLSearchParams(getQuery(url)),
    options: Object.assign(derivedOptions, options || {}),
    request: request,
    signal: (options && options.signal) || request.signal,
    pendingPromises,
  };
  return callLog;
}

export function getPath(url: string): string {
  const u = absoluteUrlRX.test(url)
    ? new URL(url)
    : new URL(url, 'http://dummy');
  return u.pathname;
}

export function getQuery(url: string): string {
  const u = absoluteUrlRX.test(url)
    ? new URL(url)
    : new URL(url, 'http://dummy');
  return u.search ? u.search.substr(1) : '';
}

export const normalizeHeaders = (headers: HeadersInit | { [key: string]: string | number }): { [key: string]: string } => {
  let entries;
  if (headers instanceof Headers) {
    entries = [...headers.entries()];
  } else if (Array.isArray(headers)) {
    entries = headers;
  } else {
    entries = Object.entries(headers);
  }
  return Object.fromEntries(
    entries.map(([key, val]) => [key.toLowerCase(), String(val).valueOf()]),
  );
};
