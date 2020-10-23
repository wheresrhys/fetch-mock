let URL;
// https://stackoverflow.com/a/19709846/308237
// split, URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

const headersToArray = (headers) => {
	// node-fetch 1 Headers
	if (typeof headers.raw === 'function') {
		return Object.entries(headers.raw());
	} else if (headers[Symbol.iterator]) {
		return [...headers];
	} else {
		return Object.entries(headers);
	}
};

const zipObject = (entries) =>
	entries.reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

const normalizeUrl = (url) => {
	if (
		typeof url === 'function' ||
		url instanceof RegExp ||
		/^(begin|end|glob|express|path)\:/.test(url)
	) {
		return url;
	}
	if (absoluteUrlRX.test(url)) {
		const u = new URL(url);
		return u.href;
	} else if (protocolRelativeUrlRX.test(url)) {
		const u = new URL(url, 'http://dummy');
		return u.href;
	} else {
		const u = new URL(url, 'http://dummy');
		return u.pathname + u.search;
	}
};

const extractBody = async (request) => {
	try {
		// node-fetch
		if ('body' in request) {
			return request.body.toString();
		}
		// fetch
		return request.clone().text();
	} catch (err) {}
};

module.exports = {
	setUrlImplementation: (it) => {
		URL = it;
	},
	normalizeRequest: (url, options, Request) => {
		if (Request.prototype.isPrototypeOf(url)) {
			const derivedOptions = {
				method: url.method,
			};

			const body = extractBody(url);

			if (typeof body !== 'undefined') {
				derivedOptions.body = body;
			}

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
		} else if (
			typeof url === 'string' ||
			// horrible URL object duck-typing
			(typeof url === 'object' && 'href' in url)
		) {
			return {
				url: normalizeUrl(url),
				options: options,
				signal: options && options.signal,
			};
		} else if (typeof url === 'object') {
			throw new TypeError(
				'fetch-mock: Unrecognised Request object. Read the Config and Installation sections of the docs'
			);
		} else {
			throw new TypeError('fetch-mock: Invalid arguments passed to fetch');
		}
	},
	normalizeUrl,
	getPath: (url) => {
		const u = absoluteUrlRX.test(url)
			? new URL(url)
			: new URL(url, 'http://dummy');
		return u.pathname;
	},

	getQuery: (url) => {
		const u = absoluteUrlRX.test(url)
			? new URL(url)
			: new URL(url, 'http://dummy');
		return u.search ? u.search.substr(1) : '';
	},
	headers: {
		normalize: (headers) => zipObject(headersToArray(headers)),
		toLowerCase: (headers) =>
			Object.keys(headers).reduce((obj, k) => {
				obj[k.toLowerCase()] = headers[k];
				return obj;
			}, {}),
		equal: (actualHeader, expectedHeader) => {
			actualHeader = Array.isArray(actualHeader)
				? actualHeader
				: [actualHeader];
			expectedHeader = Array.isArray(expectedHeader)
				? expectedHeader
				: [expectedHeader];

			if (actualHeader.length !== expectedHeader.length) {
				return false;
			}

			return actualHeader.every((val, i) => val === expectedHeader[i]);
		},
	},
};
