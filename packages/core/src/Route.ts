//@type-check
import { builtInMatchers } from './Matchers.js';
import statusTextMap from './StatusTextMap.js';
import {
	RouteMatcherFunction,
	RouteMatcherUrl,
	MatcherDefinition,
} from './Matchers.js';
import type {
	FetchMockGlobalConfig,
	FetchImplementations,
} from './FetchMock.js';
import type { CallLog } from './CallHistory.js';

export type UserRouteSpecificConfig = {
	name?: RouteName;
	method?: string;
	headers?: {
		[key: string]: string | number;
	};
	missingHeaders?: string[];
	query?: {
		[key: string]: string;
	};
	params?: {
		[key: string]: string;
	};
	body?: object;
	matcherFunction?: RouteMatcherFunction;
	url?: RouteMatcherUrl;
	response?: RouteResponse | RouteResponseFunction;
	repeat?: number;
	delay?: number;
	sticky?: boolean;
};
export type InternalRouteConfig = {
	usesBody?: boolean;
	isFallback?: boolean;
};
export type UserRouteConfig = UserRouteSpecificConfig & FetchMockGlobalConfig;
export type RouteConfig = UserRouteConfig &
	FetchImplementations &
	InternalRouteConfig;
export type RouteResponseConfig = {
	body?: BodyInit | object | null;
	status?: number;
	headers?: {
		[key: string]: string;
	};
	throws?: Error;
	redirectUrl?: string;
	options?: ResponseInit;
};
export type ResponseInitUsingHeaders = {
	status: number;
	statusText: string;
	headers: Headers;
};
export type RouteResponseObjectData = RouteResponseConfig | object;
export type RouteResponseData =
	| Response
	| number
	| string
	| RouteResponseObjectData;
export type RouteResponsePromise = Promise<RouteResponseData>;
export type RouteResponseFunction = (
	arg0: CallLog,
) => RouteResponseData | RouteResponsePromise;
export type RouteResponse =
	| RouteResponseData
	| RouteResponsePromise
	| RouteResponseFunction;
export type RouteName = string;

function isBodyInit(body: BodyInit | null | object): body is BodyInit {
	return (
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		// checks for TypedArray
		ArrayBuffer.isView(body) ||
		body instanceof DataView ||
		body instanceof FormData ||
		body instanceof ReadableStream ||
		body instanceof URLSearchParams ||
		body instanceof String ||
		typeof body === 'string' ||
		body === null
	);
}

function sanitizeStatus(status?: number): number {
	if (!status) {
		return 200;
	}

	if (
		(typeof status === 'number' &&
			parseInt(String(status), 10) !== status &&
			status >= 200) ||
		status < 600
	) {
		return status;
	}

	throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
}

class Route {
	config: RouteConfig;
	matcher: RouteMatcherFunction;

	constructor(config: RouteConfig) {
		this.config = config;
		this.#sanitize();
		this.#validate();
		this.#generateMatcher();
		this.#limit();
		this.#delayResponse();
	}

	reset() {}
	#validate() {
		if (['matched', 'unmatched'].includes(this.config.name)) {
			throw new Error(
				`fetch-mock: Routes cannot use the reserved name \`${this.config.name}\``,
			);
		}
		if (!('response' in this.config)) {
			throw new Error('fetch-mock: Each route must define a response');
		}
		if (!Route.registeredMatchers.some(({ name }) => name in this.config)) {
			throw new Error(
				"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'",
			);
		}
	}
	#sanitize() {
		if (this.config.method) {
			this.config.method = this.config.method.toLowerCase();
		}
	}
	#generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.filter(({ name }) => name in this.config)
			.map(({ matcher, usesBody }) => ({
				matcher: matcher(this.config),
				usesBody,
			}));
		this.config.usesBody = activeMatchers.some(({ usesBody }) => usesBody);
		/** @type {RouteMatcherFunction} */
		this.matcher = (normalizedRequest) =>
			activeMatchers.every(({ matcher }) => matcher(normalizedRequest));
	}
	#limit() {
		if (!this.config.repeat) {
			return;
		}
		const originalMatcher = this.matcher;
		let timesLeft = this.config.repeat;
		this.matcher = (callLog) => {
			const match = timesLeft && originalMatcher(callLog);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => {
			timesLeft = this.config.repeat;
		};
	}
	#delayResponse() {
		if (this.config.delay) {
			const { response } = this.config;
			this.config.response = () => {
				return new Promise((res) =>
					setTimeout(() => res(response), this.config.delay),
				);
			};
		}
	}

	constructResponse(responseInput: RouteResponseConfig): {
		response: Response;
		responseOptions: ResponseInit;
		responseInput: RouteResponseConfig;
	} {
		const responseOptions = this.constructResponseOptions(responseInput);
		const body = this.constructResponseBody(responseInput, responseOptions);

		return {
			response: new this.config.Response(body, responseOptions),
			responseOptions,
			responseInput,
		};
	}

	constructResponseOptions(
		responseInput: RouteResponseConfig,
	): ResponseInitUsingHeaders {
		const options = responseInput.options || {};
		options.status = sanitizeStatus(responseInput.status);
		options.statusText = statusTextMap[options.status];
		// we use Headers rather than an object because it allows us to add
		// to them without worrying about case sensitivity of keys
		options.headers = new this.config.Headers(responseInput.headers);
		return options as ResponseInitUsingHeaders;
	}
	constructResponseBody(
		responseInput: RouteResponseConfig,
		responseOptions: ResponseInitUsingHeaders,
	): BodyInit | null {
		let body = responseInput.body;
		const bodyIsBodyInit = isBodyInit(body);

		if (!bodyIsBodyInit) {
			if (typeof body === 'undefined') {
				body = null;
			} else if (typeof body === 'object') {
				// convert to json if we need to
				body = JSON.stringify(body);
				if (!responseOptions.headers.has('Content-Type')) {
					responseOptions.headers.set('Content-Type', 'application/json');
				}
			} else {
				throw new TypeError('Invalid body provided to construct response');
			}
		}

		if (typeof body === 'string') {
			// add a Content-Length header if we need to
			if (
				this.config.includeContentLength &&
				!responseOptions.headers.has('Content-Length')
			) {
				responseOptions.headers.set('Content-Length', body.length.toString());
			}
		}

		return body as BodyInit;
	}

	static defineMatcher(matcher: MatcherDefinition) {
		Route.registeredMatchers.push(matcher);
	}
	static registeredMatchers: MatcherDefinition[] = [];
}

builtInMatchers.forEach(Route.defineMatcher);

export default Route;
