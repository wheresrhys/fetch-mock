const shorthandResponseProps = [
	'body',
	'headers',
	'throws',
	'status',
	'redirectUrl'
];

module.exports = class ResponseBuilder {
	constructor(options) {
		Object.assign(this, options);
	}

	exec() {
		this.normalizeResponseConfig();
		this.constructFetchOpts();
		this.constructResponseBody();
		return this.buildObservableResponse(
			new this.fetchMock.config.Response(this.body, this.opts)
		);
	}

	sendAsObject() {
		if (shorthandResponseProps.some(prop => this.shorthandResponse[prop])) {
			if (
				Object.keys(this.shorthandResponse).every(key =>
					shorthandResponseProps.includes(key)
				)
			) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	normalizeResponseConfig() {
		// If the response config looks like a status, start to generate a simple response
		if (typeof this.shorthandResponse === 'number') {
			this.shorthandResponse = {
				status: this.shorthandResponse
			};
			// If the response config is not an object, or is an object that doesn't use
			// any reserved properties, assume it is meant to be the body of the response
		} else if (
			typeof this.shorthandResponse === 'string' ||
			this.sendAsObject()
		) {
			this.shorthandResponse = {
				body: this.shorthandResponse
			};
		}
	}

	validateStatus(status) {
		if (!status) {
			return 200;
		}

		if (
			(typeof status === 'number' &&
				parseInt(status, 10) !== status &&
				status >= 200) ||
			status < 600
		) {
			return status;
		}

		throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
	}

	constructFetchOpts() {
		this.opts = this.shorthandResponse.opts || {};
		this.opts.url = this.shorthandResponse.redirectUrl || this.url;
		this.opts.status = this.validateStatus(this.shorthandResponse.status);
		this.opts.statusText = this.fetchMock.statusTextMap['' + this.opts.status];
		// Set up response headers. The empty object is to cope with
		// new Headers(undefined) throwing in Chrome
		// https://code.google.com/p/chromium/issues/detail?id=335871
		this.opts.headers = new this.fetchMock.config.Headers(
			this.shorthandResponse.headers || {}
		);
	}

	getOption(name) {
		return name in this.route ? this.route[name] : this.fetchMock.config[name];
	}

	constructResponseBody() {
		// start to construct the body
		let body = this.shorthandResponse.body;

		// convert to json if we need to
		if (
			this.getOption('sendAsJson') &&
			this.shorthandResponse.body != null && //eslint-disable-line
			typeof body === 'object'
		) {
			body = JSON.stringify(body);
			if (!this.opts.headers.has('Content-Type')) {
				this.opts.headers.set('Content-Type', 'application/json');
			}
		}

		// add a Content-Length header if we need to
		if (
			this.getOption('includeContentLength') &&
			typeof body === 'string' &&
			!this.opts.headers.has('Content-Length')
		) {
			this.opts.headers.set('Content-Length', body.length.toString());
		}

		// On the server we need to manually construct the readable stream for the
		// Response object (on the client this done automatically)
		if (this.stream) {
			const s = new this.stream.Readable();
			if (body != null) { //eslint-disable-line
				s.push(body, 'utf-8');
			}
			s.push(null);
			body = s;
		}
		this.body = body;
	}

	buildObservableResponse(response) {
		const fetchMock = this.fetchMock;

		// Using a proxy means we can set properties that may not be writable on
		// the original Response. It also means we can track the resolution of
		// promises returned by res.json(), res.text() etc
		return new Proxy(response, {
			get: (originalResponse, name) => {
				if (this.shorthandResponse.redirectUrl) {
					if (name === 'url') {
						return this.shorthandResponse.redirectUrl;
					}

					if (name === 'redirected') {
						return true;
					}
				}

				if (typeof originalResponse[name] === 'function') {
					return new Proxy(originalResponse[name], {
						apply: (func, thisArg, args) => {
							const result = func.apply(response, args);
							if (result.then) {
								fetchMock._holdingPromises.push(result.catch(() => null));
							}
							return result;
						}
					});
				}

				return originalResponse[name];
			}
		});
	}
};
