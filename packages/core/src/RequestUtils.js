// @type-check
// https://stackoverflow.com/a/19709846/308237 plus data: scheme
// split into 2 code paths as URL constructor does not support protocol-relative urls
const absoluteUrlRX = new RegExp('^[a-z]+://|^data:', 'i');
const protocolRelativeUrlRX = new RegExp('^//', 'i');

/**
 * @param {Headers} headers 
 * @returns {[[string,string|[string]]]}
 */
const headersToArray = (headers) => {
    if (headers[Symbol.iterator]) {
        return [...headers];
    }
    return Object.entries(headers);
};

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
 * @param {new () => Request} Request 
 * @returns  {urlOrRequest is Request}
 */
const isRequest = (urlOrRequest, Request) => Request.prototype.isPrototypeOf(urlOrRequest)

/**
 * 
 * @param {string|Request} urlOrRequest
 * @param {RequestInit} options 
 * @param {new () => Request} Request 
 * @returns {NormalizedRequest}
 */
export function normalizeRequest(urlOrRequest, options, Request) {
    if (isRequest(urlOrRequest, Request)) {
       /** @type {NormalizedRequestOptions} */
        const derivedOptions = {
            method: urlOrRequest.method,
        };

        try {
            derivedOptions.body = urlOrRequest.clone().text();
        } catch (err) { }

        const headers = headersToArray(urlOrRequest.headers);

        if (headers.length) {
            derivedOptions.headers = Object.fromEntries(headers);
        }
        const normalizedRequestObject = {
            url: normalizeUrl(urlOrRequest.url),
            options: Object.assign(derivedOptions, options),
            request: urlOrRequest,
            signal: (options && options.signal) || urlOrRequest.signal,
        };
        return normalizedRequestObject;
    }
    if (
        typeof urlOrRequest === 'string' ||
        urlOrRequest instanceof String ||
        // horrible URL object duck-typing
        (typeof urlOrRequest === 'object' && 'href' in urlOrRequest)
    ) {
        return {
            url: normalizeUrl(urlOrRequest),
            options,
            signal: options && options.signal,
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

export const headers = {
    /**
     * @param {Headers} headers 
     * @returns {Object.<string, string|[string]>}
     */
    normalize: (headers) => Object.fromEntries(headersToArray(headers)),
    /**
     * 
     * @param {Object.<string, string|[string]>} headers 
     * @returns {Object.<string, string|[string]>}
     */
    toLowerCase: (headers) =>
       Object.fromEntries(Object.entries(headers).map(([key, val]) => ([key.toLowerCase(), val]))),
    
    /**
     * 
     * @param {string|[string]} actualHeader 
     * @param {string|[string]} expectedHeader 
     * @returns {boolean}
     */
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
