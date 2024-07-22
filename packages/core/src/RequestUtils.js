// @type-check
// https://stackoverflow.com/a/19709846/308237 plus data: scheme
// split into 2 code paths as URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

/**
 * @typedef DerivedRequestOptions
 * @property  {string} method
 * @property  {Promise<string>} [body]
 * @property  {{ [key: string]: string }} [headers]
 */

/** @typedef {RequestInit | (RequestInit & DerivedRequestOptions) } NormalizedRequestOptions */
/** @typedef {import('./CallHistory').CallLog} CallLog */

/**
 *
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrl(url) {
	if (absoluteUrlRX.test(url)) {
		const u = new URL(url);
		return u.href;
	}
	if (protocolRelativeUrlRX.test(url)) {
		const u = new URL(url, 'http://dummy');
		return u.href;
	}
	const u = new URL(url, 'http://dummy');
	return u.pathname + u.search;
}
/**
 *
 * @param {string|Request} urlOrRequest
 * @param {typeof Request} Request
 * @returns  {urlOrRequest is Request}
 */
const isRequest = (urlOrRequest, Request) =>
	Request.prototype.isPrototypeOf(urlOrRequest);

/**
 *
 * @param {string|Request} urlOrRequest
 * @param {RequestInit} options
 * @param {typeof Request} Request
 * @returns {CallLog}
 */
export function createCallLog(urlOrRequest, options, Request) {
	/** @type {Promise<any>[]} */
	const pendingPromises = [];
	if (isRequest(urlOrRequest, Request)) {
		/** @type {NormalizedRequestOptions} */
		const derivedOptions = {
			method: urlOrRequest.method,
		};

		try {
			derivedOptions.body = urlOrRequest.clone().text();
		} catch (err) {}

		if (urlOrRequest.headers) {
			derivedOptions.headers = normalizeHeaders(urlOrRequest.headers);
		}
		const callLog = {
			arguments: [urlOrRequest, options],
			url: normalizeUrl(urlOrRequest.url),
			options: Object.assign(derivedOptions, options || {}),
			request: urlOrRequest,
			signal: (options && options.signal) || urlOrRequest.signal,
			pendingPromises,
		};
		return callLog;
	}
	if (
		typeof urlOrRequest === 'string' ||
		/** @type {object} */ (urlOrRequest) instanceof String ||
		// horrible URL object duck-typing
		(typeof urlOrRequest === 'object' && 'href' in urlOrRequest)
	) {
		return {
			arguments: [urlOrRequest, options],
			url: normalizeUrl(urlOrRequest),
			options: options || {},
			signal: options && options.signal,
			pendingPromises,
		};
	}
	if (typeof urlOrRequest === 'object') {
		throw new TypeError(
			'fetch-mock: Unrecognised Request object. Read the Config and Installation sections of the docs',
		);
	} else {
		throw new TypeError('fetch-mock: Invalid arguments passed to fetch');
	}
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
 * @param {Headers | [string, string][] | Record < string, string > | Object.<string, string | number>} headers
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
