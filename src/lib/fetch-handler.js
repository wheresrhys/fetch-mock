const ResponseBuilder = require('./response-builder');

const FetchMock = {};

FetchMock.fetchHandler = function (url, opts) {

	let response = this.executeRouter(url, opts);

	// If the response says to throw an error, throw it
	// It only makes sense to do this before doing any async stuff below
	// as the async stuff swallows catastrophic errors in a promise
	// Type checking is to deal with sinon spies having a throws property :-0
	if (response.throws && typeof response !== 'function') {
		throw response.throws;
	}

	// this is used to power the .flush() method
	let done
	this._holdingPromises.push(new this.config.Promise(res => done = res));

	// wrapped in this promise to make sure we respect custom Promise
	// constructors defined by the user
	return new this.config.Promise((res, rej) => {
		this.generateResponse(response, url, opts)
			.then(res, rej)
			.then(done, done);
	})
}

FetchMock.fetchHandler.isMock = true;

FetchMock.executeRouter = function (url, opts) {

	let response = this.router(url, opts);

	if (response) {
		return response;
	}

	if (this.config.warnOnFallback) {
		console.warn(`Unmatched ${opts && opts.method || 'GET'} to ${url}`); // eslint-disable-line
	}

	this.push(null, [url, opts]);

	if (this.fallbackResponse) {
		return this.fallbackResponse;
	}

	if (!this.config.fallbackToNetwork) {
		throw new Error(`No fallback response defined for ${opts && opts.method || 'GET'} to ${url}`)
	}

	return this.getNativeFetch();
}

FetchMock.generateResponse = async function (response, url, opts) {
	// We want to allow things like
	// - function returning a Promise for a response
	// - delaying (using a timeout Promise) a function's execution to generate
	//   a response
	// Keep it DRY, and flexible, we keep trying until we
	// have something that looks like neither Promise nor function

	while (typeof response === 'function' || typeof response.then === 'function') {
		// got promise or async function, since we don't need to build a response
		// with simply return it (ex. in case fallbackToNetwork == true)
		if (response instanceof Promise) return response;
		else response = response(url, opts);
	}

	// If the response is a pre-made Response, respond with it
	if (this.config.Response.prototype.isPrototypeOf(response)) {
		return response;
	}

	// finally, if we need to convert config into a response, we do it
	return new ResponseBuilder(url, response, this).exec();
}


FetchMock.router = function (url, opts) {
	const route = this.routes.find(route => route.matcher(url, opts));

	if (route) {
		this.push(route.name, [url, opts]);
		return route.response;
	}
}

FetchMock.getNativeFetch = function () {
	const func = this.realFetch || (this.isSandbox && this.config.fetch);
	if (!func) {
		throw new Error('Falling back to network only available on gloabl fetch-mock, or by setting config.fetch on sandboxed fetch-mock');
	}
	return func;
}

FetchMock.push = function (name, args) {
	if (name) {
		this._calls[name] = this._calls[name] || [];
		this._calls[name].push(args);
		this._allCalls.push(args);
	} else {
		args.unmatched = true;
		this._allCalls.push(args);
	}
};

module.exports = FetchMock;