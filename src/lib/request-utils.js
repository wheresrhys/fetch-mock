const URL = require('whatwg-url');
// https://stackoverflow.com/a/19709846/308237
const absoluteUrlRX = new RegExp('^(?:[a-z]+:)?//', 'i');

const toArray = headers => {
	// node-fetch 1 Headers
	if (typeof headers.raw === 'function') {
		return Object.entries(headers.raw());
	} else if (headers[Symbol.iterator]) {
		return [...headers];
	} else {
		return Object.entries(headers);
	}
};

const zip = entries =>
	entries.reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

module.exports = {
	normalizeUrl: url => {
		if (
			typeof url === 'function' ||
			url instanceof RegExp ||
			/^(begin|end|glob|express|path)\:/.test(url)
		) {
			return url;
		}
		if (absoluteUrlRX.test(url)) {
			const u = new URL.URL(url);
			return u.href;
		} else {
			const u = new URL.URL(url, 'http://dummy');
			return u.pathname + u.search;
		}
	},
	getPath: url => {
		const u = absoluteUrlRX.test(url)
			? new URL.URL(url)
			: new URL.URL(url, 'http://dummy');
		return u.pathname;
	},
	headers: {
		normalize: headers => zip(toArray(headers)),
		toArray,
		zip,
		toLowerCase: headers =>
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
		}
	}
};
