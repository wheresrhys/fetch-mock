function ResponseBuilder (url, responseConfig, config, statusTextMap) {
	this.url = url;
	this.responseConfig = responseConfig;
	this.fetchMockConfig = config;
	this.statusTextMap = statusTextMap;
}

const proto = ResponseBuilder.prototype

proto.build = function () {
	this.normalizeResponseConfig();
	this.validateResponseConfig();
	this.constructFetchOpts();
	// Set up response headers. The ternary operator is to cope with
	// new Headers(undefined) throwing in Chrome
	// https://code.google.com/p/chromium/issues/detail?id=335871
	this.opts.headers = this.responseConfig.headers ? new this.fetchMockConfig.Headers(this.responseConfig.headers) : new this.fetchMockConfig.Headers();

	// start to construct the body
	let body = this.responseConfig.body;

	// convert to json if we need to
	const sendAsJson = this.responseConfig.sendAsJson === undefined ? this.fetchMockConfig.sendAsJson : this.responseConfig.sendAsJson;
	if (sendAsJson && this.responseConfig.body != null && typeof body === 'object') { //eslint-disable-line
		body = JSON.stringify(body);
	}

	// add a Content-Length header if we need to
	const includeContentLength = this.responseConfig.includeContentLength === undefined ? this.fetchMockConfig.includeContentLength : this.responseConfig.includeContentLength;
	if (includeContentLength && typeof body === 'string' && !this.opts.headers.has('Content-Length')) {
		this.opts.headers.set('Content-Length', body.length.toString());
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
	let response = new this.fetchMockConfig.Response(body, this.opts);

	// When mocking a followed redirect we must wrap the response in an object
	// which sets the redirected flag (not a writable property on the actual response)
	if (this.responseConfig.redirectUrl) {
		response = Object.create(response, {
			redirected: {
				value: true
			},
			url: {
				value: this.responseConfig.redirectUrl
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

proto.normalizeResponseConfig = function () {
	// If the response config looks like a status, start to generate a simple response
	if (typeof this.responseConfig === 'number') {
		this.responseConfig = {
			status: this.responseConfig
		};
	// If the response config is not an object, or is an object that doesn't use
	// any reserved properties, assume it is meant to be the body of the response
	} else if (typeof this.responseConfig === 'string' || !(
		this.responseConfig.body ||
		this.responseConfig.headers ||
		this.responseConfig.throws ||
		this.responseConfig.status ||
		this.responseConfig.redirectUrl
	)) {
		this.responseConfig = {
			body: this.responseConfig
		};
	}
}

proto.validateResponseConfig = function () {
	// Handle a reasonably common misuse of the library - returning an object
	// with the property 'status'
	const status = this.responseConfig.status;

	if (!status) {
		return;
	}

	if (typeof status === 'number' && parseInt(status, 10) !== status) {
		return;
	}

	if (status < 200 || status > 599) {
		throw new TypeError(`Invalid status ${responseConfig.status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	}
}

proto.constructFetchOpts = function () {

	// Now we are sure we're dealing with a response config object, so start to
	// construct a real response from it
	this.opts = this.responseConfig.opts || {};

	// set the response url
	this.opts.url = this.responseConfig.redirectUrl || this.url;

	// set up the response status
	this.opts.status = this.responseConfig.status || 200;
	this.opts.statusText = this.statusTextMap['' + this.opts.status];
}

module.exports = ResponseBuilder