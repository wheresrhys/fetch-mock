import type { CallLog } from './CallHistory.js';
// https://stackoverflow.com/a/19709846/308237 plus data: scheme
// split into 2 code paths as URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

interface DerivedRequestOptions {
	method: string;
	body?: string;
	headers?: { [key: string]: string };
}

export type NormalizedRequestOptions =
	| RequestInit
	| (RequestInit & DerivedRequestOptions);

export function hasCredentialsInUrl(url: string): boolean {
	const urlObject = new URL(
		url,
		!absoluteUrlRX.test(url) ? 'http://dummy' : undefined,
	);
	return Boolean(urlObject.username || urlObject.password);
}

export function normalizeUrl(
	url: string | String | URL,
	allowRelativeUrls: boolean,
) {
	if (url instanceof URL) {
		return url.href;
	}
	const primitiveUrl: string = String(url).valueOf();

	if (absoluteUrlRX.test(primitiveUrl)) {
		return new URL(primitiveUrl).href;
	}
	if (protocolRelativeUrlRX.test(primitiveUrl)) {
		return new URL(primitiveUrl, 'http://dummy').href.replace(/^[a-z]+:/, '');
	}

	if ('location' in globalThis) {
		if (primitiveUrl.startsWith('/')) {
			return `${globalThis.location.origin}${primitiveUrl}`;
		} else {
			return `${globalThis.location.href}/${primitiveUrl}`;
		}
	} else if (allowRelativeUrls) {
		const urlInstance = new URL(primitiveUrl, 'http://dummy');
		return urlInstance.pathname + urlInstance.search;
	} else {
		throw new Error(
			'Relative urls are not support by default in node.js tests. Either use a utility such as jsdom to define globalThis.location or set `fetchMock.config.allowRelativeUrls = true`',
		);
	}
}

export function createCallLogFromUrlAndOptions(
	url: string | String | object,
	options: RequestInit,
): CallLog {
	const pendingPromises: Promise<unknown>[] = [];
	if (typeof url === 'string' || url instanceof String || url instanceof URL) {
		const normalizedUrl: string = normalizeUrl(url, true);
		const derivedOptions = options ? { ...options } : {};
		if (derivedOptions.headers) {
			derivedOptions.headers = normalizeHeaders(derivedOptions.headers);
		}
		derivedOptions.method = derivedOptions.method
			? derivedOptions.method.toLowerCase()
			: 'get';
		return {
			args: [url, options],
			url: normalizedUrl,
			queryParams: new URLSearchParams(getQuery(normalizedUrl)),
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

export async function createCallLogFromRequest(
	request: Request,
	options: RequestInit,
): Promise<CallLog> {
	const pendingPromises: Promise<unknown>[] = [];
	const derivedOptions: NormalizedRequestOptions = {
		method: request.method,
	};

	try {
		try {
			derivedOptions.body = await request.clone().formData();
		} catch {
			derivedOptions.body = await request.clone().text();
		}
	} catch {} // eslint-disable-line no-empty
	if (request.headers) {
		derivedOptions.headers = normalizeHeaders(request.headers);
	}
	const url = normalizeUrl(request.url, true);
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

export function getHost(url: string): string | null {
	if (absoluteUrlRX.test(url)) {
		return new URL(url).host;
	} else if ('location' in globalThis) {
		return globalThis.location.host
	}
	return null
}

export function getQuery(url: string): string {
	const u = absoluteUrlRX.test(url)
		? new URL(url)
		: new URL(url, 'http://dummy');
	return u.search ? u.search.substr(1) : '';
}

export function normalizeHeaders(
	headers: HeadersInit | { [key: string]: string | number },
): { [key: string]: string } {
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
}
