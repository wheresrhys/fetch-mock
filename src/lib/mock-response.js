module.exports = function (url, responseConfig, fetchOpts) {
	const Promise = this.config.Promise;

	// It seems odd to call this in here even though it's already called within fetchMock
	// It's to handle the fact that because we want to support making it very easy to add a
	// delay to any sort of response (including responses which are defined with a function)
	// while also allowing function responses to return a Promise for a response config.
	if (typeof responseConfig === 'function') {
		responseConfig = responseConfig(url, fetchOpts);
	}

	// If the response is a pre-made Response, respond with it
	if (this.config.Response.prototype.isPrototypeOf(responseConfig)) {
		return responseConfig;
	}

	// If the response says to throw an error, throw it
	if (responseConfig.throws) {
		throw responseConfig.throws;
	}

	// If the response config looks like a status, start to generate a simple response
	if (typeof responseConfig === 'number') {
		responseConfig = {
			status: responseConfig
		};
	// If the response config is not an object, or is an object that doesn't use
	// any reserved properties, assume it is meant to be the body of the response
	} else if (typeof responseConfig === 'string' || !(
		responseConfig.body ||
		responseConfig.headers ||
		responseConfig.throws ||
		responseConfig.status ||
		responseConfig.redirectUrl
	)) {
		responseConfig = {
			body: responseConfig
		};
	}

	// Now we are sure we're dealing with a response config object, so start to
	// construct a real response from it
	const opts = responseConfig.opts || {};

	// set the response url
	opts.url = responseConfig.redirectUrl || url;

	// Handle a reasonably common misuse of the library - returning an object
	// with the property 'status'
	if (responseConfig.status && (typeof responseConfig.status !== 'number' || parseInt(responseConfig.status, 10) !== responseConfig.status || responseConfig.status < 200 || responseConfig.status > 599)) {
		throw new TypeError(`Invalid status ${responseConfig.status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	}

	// set up the response status
	opts.status = responseConfig.status || 200;
	opts.statusText = this.statusTextMap['' + opts.status];

	// Set up response headers. The ternary operator is to cope with
	// new Headers(undefined) throwing in Chrome
	// https://code.google.com/p/chromium/issues/detail?id=335871
	opts.headers = responseConfig.headers ? new this.config.Headers(responseConfig.headers) : new this.config.Headers();

	// start to construct the body
	let body = responseConfig.body;

	// convert to json if we need to
	opts.sendAsJson = responseConfig.sendAsJson === undefined ? this.config.sendAsJson : responseConfig.sendAsJson;
	if (opts.sendAsJson && responseConfig.body != null && typeof body === 'object') { //eslint-disable-line
		body = JSON.stringify(body);
	}

	// add a Content-Length header if we need to
	opts.includeContentLength = responseConfig.includeContentLength === undefined ? this.config.includeContentLength : responseConfig.includeContentLength;
	if (opts.includeContentLength && typeof body === 'string' && !opts.headers.has('Content-Length')) {
		opts.headers.set('Content-Length', body.length.toString());
	}

	// On the server we need to manually construct the readable stream for the
	// Response object (on the client this i automatically)
	if (this.stream) {
		let s = new this.stream.Readable();
		if (body != null) { //eslint-disable-line
			s.push(body, 'utf-8');
		}
		s.push(null);
		body = s;
	}
	let response = new this.config.Response(body, opts);

	// When mocking a followed redirect we must wrap the response in an object
	// which sets the redirected flag (not a writable property on the actual response)
	if (responseConfig.redirectUrl) {
		response = Object.create(response, {
			redirected: {
				value: true
			},
			url: {
				value: responseConfig.redirectUrl
			},
			// TODO extend to all other methods as requested by users
			// Such a nasty hack
			text: {
				value: response.text.bind(response)
			},
			json: {
				value: response.json.bind(response)
			}
		})
	}

	return response;
}