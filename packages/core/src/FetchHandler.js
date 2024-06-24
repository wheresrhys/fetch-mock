//@type-check
/** @typedef {import('./Route')} Route */
/** @typedef {import('./CallHistory').CallLog} CallLog */
/** @typedef {import('./FetchMock')} FetchMock */
/** @typedef {import('./Route').RouteOptions} RouteOptions */
/** @typedef {import('./Route').RouteResponse} RouteResponse */
/** @typedef {import('./Route').RouteResponseFunction} RouteResponseFunction */

import {buildResponse} from './ResponseBuilder.js';
import * as requestUtils from './RequestUtils.js';
/**
 * 
 * @param {RouteResponse} response 
 * @returns {RouteResponse is RouteResponseFunction}
 */
const isPromise = response => typeof /** @type {Promise<any>} */(response).then === 'function'

/**
 * @param {RouteOptions} route
 * @param {string} url
 * @param {RequestInit} options
 * @param {Request} request
 * @returns
 */
const resolveUntilResponseConfig = async (
	{ response },
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
	//eslint-disable-next-line no-constant-condition
	while (true) {
		if (typeof response === 'function') {
			response = response(url, options, request);
		} else if (isPromise(response)) {
			response = await response; // eslint-disable-line  no-await-in-loop
		} else {
			return response;
		}
	}
};

/**
 *
 * @param {Object} input
 * @param {Route} input.route
 * @param {string} input.url
 * @param {RequestInit} input.options
 * @param {Request} [input.request]
 * @param {CallLog} input.callLog
 * @returns {Promise<Response>}
 */
const generateResponse = async ({
	route,
	url,
	options,
	request,
	callLog,
}) => {
	const response = await resolveUntilResponseConfig(
		route.routeOptions,
		url,
		options,
		request,
	);

	// finally, if we need to convert config into a response, we do it
	const [realResponse, finalResponse] = buildResponse({
		url,
		responseConfig: response,
		route,
	});

	callLog.response = realResponse;

	return finalResponse;
};
/**
 *
 * @param {string | Request} requestInput
 * @param {RequestInit} [requestInit]
 * @this {FetchMock}
 * @returns {Promise<Response>}
 */
const fetchHandler = async function (requestInput, requestInit) {
	const normalizedRequest = requestUtils.normalizeRequest(
		requestInput,
		requestInit,
		this.config.Request,
	);
	const { url, options, request, signal } = normalizedRequest;

	if (signal) {
		const abort = () => {
			done();
			throw new DOMException('The operation was aborted.', 'AbortError');
		};
		if (signal.aborted) {
			abort();
		}
		signal.addEventListener('abort', abort);
	}

	if (this.router.needsToReadBody(options)) {
		options.body = await options.body;
	}

	const { route, callLog } = this.router.execute(normalizedRequest);
	// TODO log the call IMMEDIATELY and then route gradually adds to it
	this.callHistory.recordCall(callLog);

	

	// this is used to power the .flush() method
	/** @type {function(any): void} */
	let done;

	// TODO holding promises should be attached to each callLog
	this.callHistory.addHoldingPromise(
		new Promise((res) => {
			done = res;
		}),
	);

	const response = generateResponse({
		route,
		url,
		options,
		request,
		callLog,
	});

	response.then(done, done);

	return response;
};

fetchHandler.isMock = true;

export default fetchHandler;
