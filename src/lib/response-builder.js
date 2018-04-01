const responseConfigProps = [
	'body',
	'headers',
	'throws',
	'status',
	'redirectUrl',
	'includeContentLength',
	'sendAsJson'
];

module.exports = class ResponseBuilder {
	constructor (url, responseConfig, fetchMock) {
		this.url = typeof url === 'object' ? url.url : url;
		this.fetchMockInstance = fetchMock;
		this.responseConfig = responseConfig;
		this.fetchMockConfig = fetchMock.config;
		this.statusTextMap = fetchMock.statusTextMap;
		this.Response = fetchMock.config.Response;
		this.Headers = fetchMock.config.Headers;
		this._holdingPromises = fetchMock._holdingPromises;
	}

	exec () {
		this.normalizeResponseConfig();
		this.constructFetchOpts();
		this.constructResponseBody();
		return this.observe(new this.Response(this.body, this.opts));
	}

	sendAsObject () {
		if (responseConfigProps.some(prop => this.responseConfig[prop])) {
			if (Object.keys(this.responseConfig).every(key => responseConfigProps.includes(key))) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	normalizeResponseConfig () {
		// If the response config looks like a status, start to generate a simple response
		if (typeof this.responseConfig === 'number') {
			this.responseConfig = {
				status: this.responseConfig
			};
		// If the response config is not an object, or is an object that doesn't use
		// any reserved properties, assume it is meant to be the body of the response
		} else if (typeof this.responseConfig === 'string' || this.sendAsObject()) {
			this.responseConfig = {
				body: this.responseConfig
			};
		}
	}

	validateStatus (status) {
		if (!status) {
			return 200;
		}

		if (typeof status === 'number' && parseInt(status, 10) !== status && status >= 200 || status < 600) {
			return status;
		}

		throw new TypeError(`Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	}

	constructFetchOpts () {
		this.opts = this.responseConfig.opts || {};
		this.opts.url = this.responseConfig.redirectUrl || this.url;
		this.opts.status = this.validateStatus(this.responseConfig.status);
		this.opts.statusText = this.statusTextMap['' + this.opts.status];
		// Set up response headers. The empty object is to cope with
		// new Headers(undefined) throwing in Chrome
		// https://code.google.com/p/chromium/issues/detail?id=335871
		this.opts.headers = new this.Headers(this.responseConfig.headers || {});
	}

	getOption (name) {
		return this.responseConfig[name] === undefined ? this.fetchMockConfig[name] : this.responseConfig[name];
	}

	constructResponseBody () {
		// start to construct the body
		let body = this.responseConfig.body;

		// convert to json if we need to
		if (this.getOption('sendAsJson') && this.responseConfig.body != null && typeof body === 'object') { //eslint-disable-line
			body = JSON.stringify(body);
			if(!this.opts.headers.has('Content-Type')) {
				this.opts.headers.set('Content-Type', 'application/json');
			}
		}

		// add a Content-Length header if we need to
		if (this.getOption('includeContentLength') && typeof body === 'string' && !this.opts.headers.has('Content-Length')) {
			this.opts.headers.set('Content-Length', body.length.toString());
		}

		// On the server we need to manually construct the readable stream for the
		// Response object (on the client this done automatically)
		if (this.stream) {
			let s = new this.stream.Readable();
			if (body != null) { //eslint-disable-line
				s.push(body, 'utf-8');
			}
			s.push(null);
			body = s;
		}
		this.body = body;
	}

	observe (response) {

		const fetchMock = this.fetchMockInstance;

		// Using a proxy means we can set properties that may not be writable on
		// the original Response. It also means we can track the resolution of
		// promises returned by res.json(), res.text() etc
		return new Proxy(response, {
			get: (originalResponse, name) => {
				if (this.responseConfig.redirectUrl) {
					if (name === 'url') {
						return this.responseConfig.redirectUrl
					}

					if (name === 'redirected') {
						return true;
					}
				}

				if (typeof originalResponse[name] === 'function') {

					return new Proxy(originalResponse[name], {
						apply: (func, thisArg, args) => {
							const result = func.apply(thisArg, args);
							if (result.then) {
								fetchMock._holdingPromises.push(result.catch(() => null))
							}
							return result;
						}
					})
				}

				return originalResponse[name];
			}
		});
	}
}
