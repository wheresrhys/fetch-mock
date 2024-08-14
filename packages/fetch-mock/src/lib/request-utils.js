// https://stackoverflow.com/a/19709846/308237 plus data: scheme
// split into 2 code paths as URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

const headersToArray = (headers) => {
	// node-fetch 1 Headers
	if (typeof headers.raw === 'function') {
		return Object.entries(headers.raw());
	}
	if (headers[Symbol.iterator]) {
		return [...headers];
	}
	return Object.entries(headers);
};

const zipObject = (entries) =>
	entries.reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

export function normalizeUrl(url) {
	if (
		typeof url === 'function' ||
		url instanceof RegExp ||
		/^(begin|end|glob|express|path):/.test(url)
	) {
		return url;
	}
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

export function normalizeRequest(url, options, Request) {
	if (Request.prototype.isPrototypeOf(url)) {
		const derivedOptions = {
			method: url.method,
		};

		try {
			derivedOptions.body = url.clone().text();
		} catch {} // eslint-disable-line no-empty

		const normalizedRequestObject = {
			url: normalizeUrl(url.url),
			options: Object.assign(derivedOptions, options),
			request: url,
			signal: (options && options.signal) || url.signal,
		};

		const headers = headersToArray(url.headers);

		if (headers.length) {
			normalizedRequestObject.options.headers = zipObject(headers);
		}
		return normalizedRequestObject;
	}
	if (
		typeof url === 'string' ||
		url instanceof String ||
		// horrible URL object duck-typing
		(typeof url === 'object' && 'href' in url)
	) {
		return {
			url: normalizeUrl(url),
			options,
			signal: options && options.signal,
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

export function getPath(url) {
	const u = absoluteUrlRX.test(url)
		? new URL(url)
		: new URL(url, 'http://dummy');
	return u.pathname;
}

export function getQuery(url) {
	const u = absoluteUrlRX.test(url)
		? new URL(url)
		: new URL(url, 'http://dummy');
	return u.search ? u.search.substr(1) : '';
}

export const headers = {
	normalize: (headers) => zipObject(headersToArray(headers)),
	toLowerCase: (headers) =>
		Object.keys(headers).reduce((obj, k) => {
			obj[k.toLowerCase()] = headers[k];
			return obj;
		}, {}),
	equal: (actualHeader, expectedHeader) => {
		actualHeader = Array.isArray(actualHeader) ? actualHeader : [actualHeader];
		expectedHeader = Array.isArray(expectedHeader)
			? expectedHeader
			: [expectedHeader];

		if (actualHeader.length !== expectedHeader.length) {
			return false;
		}

		return actualHeader.every((val, i) => val === expectedHeader[i]);
	},
};
