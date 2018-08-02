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
	normalize: headers => zip(toArray(headers)),
	toArray,
	zip,
	toLowerCase: headers =>
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
	}
};
