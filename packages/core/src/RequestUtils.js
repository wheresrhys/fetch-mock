// @type-check
// https://stackoverflow.com/a/19709846/308237 plus data: scheme
// split into 2 code paths as URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

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
export function normalizeUrl(url) {
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

/**
 *
 * @param {string | object} url
 * @param {RequestInit} options
 * @returns {CallLog}
 */
export function createCallLogFromUrlAndOptions(url, options) {
	/** @type {Promise<any>[]} */
	const pendingPromises = [];
	if (typeof url === 'string' || url instanceof String || url instanceof URL) {
		return {
			arguments: [url, options],
			// @ts-ignore - jsdoc doesn't distinguish between string and String, but typechecker complains
			url: normalizeUrl(url),
			options: options || {},
			signal: options && options.signal,
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

/**
 *
 * @param {Request} request
 * @param {RequestInit} options
 * @returns {Promise<CallLog>}
 */
export async function createCallLogFromRequest(request, options) {
	/** @type {Promise<any>[]} */
	const pendingPromises = [];
	/** @type {NormalizedRequestOptions} */
	const derivedOptions = {
		method: request.method,
	};

	try {
		derivedOptions.body = await request.clone().text();
	} catch (err) {}

	if (request.headers) {
		derivedOptions.headers = normalizeHeaders(request.headers);
	}
	const callLog = {
		arguments: [request, options],
		url: normalizeUrl(request.url),
		options: Object.assign(derivedOptions, options || {}),
		request: request,
		signal: (options && options.signal) || request.signal,
		pendingPromises,
	};
	return callLog;
}

/**
 * @param {string} url
 * @returns {string}
 */
export function getPath(url) {
	const u = absoluteUrlRX.test(url)
		? new URL(url)
		: new URL(url, 'http://dummy');
	return u.pathname;
}

/**
 * @param {string} url
 * @returns {string}
 */
export function getQuery(url) {
	const u = absoluteUrlRX.test(url)
		? new URL(url)
		: new URL(url, 'http://dummy');
	return u.search ? u.search.substr(1) : '';
}

/**
 *
 * @param {Headers | [string, string][] | Record < string, string > | Object.<string, string | number> | HeadersInit} headers
 * @returns {Object.<string, string>}
 */
export const normalizeHeaders = (headers) => {
	const entries =
		headers instanceof Headers
			? [...headers.entries()]
			: Object.entries(headers);
	return Object.fromEntries(
		entries.map(([key, val]) => [key.toLowerCase(), String(val).valueOf()]),
	);
};
