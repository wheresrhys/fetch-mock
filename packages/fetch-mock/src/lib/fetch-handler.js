import responseBuilder from './response-builder.js';
import * as requestUtils from './request-utils.js';

const FetchMock = {};

const resolve = async (
	{ response, responseIsFetch = false },
	url,
	options,
	request,
) => {
	// We want to allow things like
	// - function returning a Promise for a response
	// - delaying (using a timeout Promise) a function's execution to generate
	//   a response
	// Because of this we can't safely check for function before Promisey-ness,
	// or vice versa. So to keep it DRY, and flexible, we keep trying until we
	// have something that looks like neither Promise nor function

	while (true) {
		if (typeof response === 'function') {
			// in the case of falling back to the network we need to make sure we're using
			// the original Request instance, not our normalised url + options
			if (responseIsFetch) {
				if (request) {
					return response(request);
				}
				return response(url, options);
			}
			response = response(url, options, request);
		} else if (typeof response.then === 'function') {
			response = await response;
		} else {
			return response;
		}
	}
};

FetchMock.needsAsyncBodyExtraction = function ({ request }) {
	return request && this.routes.some(({ usesBody }) => usesBody);
};

FetchMock.fetchHandler = function (url, options) {
	const normalizedRequest = requestUtils.normalizeRequest(
		url,
		options,
		this.config.Request,
	);

	if (this.needsAsyncBodyExtraction(normalizedRequest)) {
		return this._extractBodyThenHandle(normalizedRequest);
	}
	return this._fetchHandler(normalizedRequest);
};

FetchMock._extractBodyThenHandle = async function (normalizedRequest) {
	normalizedRequest.options.body = await normalizedRequest.options.body;
	return this._fetchHandler(normalizedRequest);
};

FetchMock._fetchHandler = function ({ url, options, request, signal }) {
	const { route, callLog } = this.executeRouter(url, options, request);

	this.recordCall(callLog);

	// this is used to power the .flush() method
	let done;
	this._holdingPromises.push(
		new Promise((res) => {
			done = res;
		}),
	);

	// wrapped in this promise to make sure we respect custom Promise
	// constructors defined by the user
	return new Promise((res, rej) => {
		if (signal) {
			const abort = () => {
				rej(new DOMException('The operation was aborted.', 'AbortError'));
				done();
			};
			if (signal.aborted) {
				abort();
			}
			signal.addEventListener('abort', abort);
		}

		this.generateResponse({
			route,
			url,
			options,
			request,
			callLog,
		})
			.then(res, rej)
			.then(done, done);
	});
};

FetchMock.fetchHandler.isMock = true;

FetchMock.executeRouter = function (url, options, request) {
	const callLog = {
		url,
		options,
		request,
		isUnmatched: true,
	};
	if (this.getOption('fallbackToNetwork') === 'always') {
		return {
			route: { response: this.getNativeFetch(), responseIsFetch: true },
			// BUG - this callLog never used to get sent. Discovered the bug
			// but can't fix outside a major release as it will potentially
			// cause too much disruption
			//
			// callLog,
		};
	}

	const route = this.router(url, options, request);

	if (route) {
		return {
			route,
			callLog: {
				url,
				options,
				request,
				identifier: route.identifier,
			},
		};
	}

	if (this.getOption('warnOnFallback')) {
		console.warn(`Unmatched ${(options && options.method) || 'GET'} to ${url}`);
	}

	if (this.fallbackResponse) {
		return { route: { response: this.fallbackResponse }, callLog };
	}

	if (!this.getOption('fallbackToNetwork')) {
		throw new Error(
			`fetch-mock: No fallback response defined for ${
				(options && options.method) || 'GET'
			} to ${url}`,
		);
	}

	return {
		route: { response: this.getNativeFetch(), responseIsFetch: true },
		callLog,
	};
};

FetchMock.generateResponse = async function ({
	route,
	url,
	options,
	request,
	callLog = {},
}) {
	const response = await resolve(route, url, options, request);

	// If the response says to throw an error, throw it
	// Type checking is to deal with sinon spies having a throws property :-0
	if (response.throws && typeof response !== 'function') {
		throw response.throws;
	}

	// If the response is a pre-made Response, respond with it
	if (this.config.Response.prototype.isPrototypeOf(response)) {
		callLog.response = response;
		return response;
	}

	// finally, if we need to convert config into a response, we do it
	const [realResponse, finalResponse] = responseBuilder({
		url,
		responseConfig: response,
		fetchMock: this,
		route,
	});

	callLog.response = realResponse;

	return finalResponse;
};

FetchMock.router = function (url, options, request) {
	const route = this.routes.find((route) => {
		return route.matcher(url, options, request);
	});

	if (route) {
		return route;
	}
};

FetchMock.getNativeFetch = function () {
	const func = this.realFetch || (this.isSandbox && this.config.fetch);
	if (!func) {
		throw new Error(
			'fetch-mock: Falling back to network only available on global fetch-mock, or by setting config.fetch on sandboxed fetch-mock',
		);
	}
	return func;
};

FetchMock.recordCall = function (obj) {
	if (obj) {
		this._calls.push(obj);
	}
};

export default FetchMock;
