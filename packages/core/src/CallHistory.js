//@type-check
/** @typedef {import('./Route').RouteConfig} RouteConfig */
/** @typedef {import('./Route').RouteName} RouteName */
/** @typedef {import('./RequestUtils').NormalizedRequestOptions} NormalizedRequestOptions */
/** @typedef {import('./Matchers').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock').FetchMockConfig} FetchMockConfig */
import { normalizeRequest } from './RequestUtils.js';
import { isUrlMatcher } from './Matchers.js';
import Route from './Route.js';

/**
 * @typedef CallLog
 * @property {string} url
 * @property {NormalizedRequestOptions} options
 * @property {Request} [request]
 * @property {Route} [route]
 * @property {Response} [response]
 * @property {Promise<any>[]} pendingPromises
 */

/** @typedef {'matched'} Matched */
/** @typedef {'unmatched'} Unmatched */
/** @typedef  {RouteName | Matched| Unmatched| boolean | RouteMatcher } CallHistoryFilter*/

/**
 *
 * @param {CallHistoryFilter} filter
 * @returns {filter is RouteName}
 */
const isName = (filter) =>
	typeof filter === 'string' &&
	/^[\da-zA-Z\-]+$/.test(filter) &&
	!['matched', 'unmatched'].includes(filter);

/**
 *
 * @param {CallHistoryFilter} filter
 * @returns {filter is (Matched| Unmatched| boolean)}
 */
const isMatchedOrUnmatched = (filter) =>
	typeof filter === 'boolean' ||
	/** @type {CallHistoryFilter[]}*/ (['matched', 'unmatched']).includes(filter);

class CallHistory {
	/**
	 * @param {FetchMockConfig} globalConfig
	 * @param router
	 */
	constructor(globalConfig, router) {
		/** @type {CallLog[]} */
		this.callLogs = [];
		this.config = globalConfig;
		this.router = router;
	}
	/**
	 *
	 * @param {CallLog} callLog
	 */
	recordCall(callLog) {
		this.callLogs.push(callLog);
	}

	clear() {
		this.callLogs.forEach(({ route }) => route.reset());
		this.callLogs = [];
	}

	/**
	 *
	 * @param {boolean} [waitForResponseMethods]
	 * @returns {Promise<void>}
	 */
	async flush(waitForResponseMethods) {
		const queuedPromises = this.callLogs.flatMap(
			(call) => call.pendingPromises,
		);
		await Promise.allSettled(queuedPromises);
		if (waitForResponseMethods) {
			// forces an extra tick, which is needed to ensure that flush doesn't resolve
			// before all the complicated promises we set up in the proxy that wraps all
			// the response body methods
			await Promise.resolve();
			await this.flush();
		}
	}

	/**
	 *
	 * @param {CallHistoryFilter} filter
	 * @param {RouteConfig} options
	 * @returns {CallLog[]}
	 */
	calls(filter, options) {
		let calls = [...this.callLogs];
		if (typeof filter === 'undefined' && !options) {
			return calls;
		}

		if (isMatchedOrUnmatched(filter)) {
			if (
				/** @type {CallHistoryFilter[]} */ ([true, 'matched']).includes(filter)
			) {
				calls = calls.filter(({ route }) => !route.config.isFallback);
			} else if (
				/** @type {CallHistoryFilter[]} */ ([false, 'unmatched']).includes(
					filter,
				)
			) {
				calls = calls.filter(({ route }) => Boolean(route.config.isFallback));
			}

			if (!options) {
				return calls;
			}
		} else if (isName(filter)) {
			calls = calls.filter(
				({
					route: {
						config: { name },
					},
				}) => name === filter,
			);
			if (!options) {
				return calls;
			}
		} else {
			if (isUrlMatcher(filter)) {
				options = { matcher: filter, ...(options || {}) };
			} else {
				options = { ...filter, ...(options || {}) };
			}
		}

		const { matcher } = new Route({
			response: 'ok',
			...options,
		});

		calls = calls.filter(({ url, options }) => {
			const {
				url: normalizedUrl,
				options: normalizedOptions,
				request,
			} = normalizeRequest(url, options, this.config.Request);
			return matcher(normalizedUrl, normalizedOptions, request);
		});

		return calls;
	}
	/**
	 *
	 * @param {CallHistoryFilter} filter
	 * @param {RouteConfig} options
	 * @returns {boolean}
	 */
	called(filter, options) {
		return Boolean(this.calls(filter, options).length);
	}
	/**
	 *
	 * @param {CallHistoryFilter} filter
	 * @param {RouteConfig} options
	 * @returns {CallLog}
	 */
	lastCall(filter, options) {
		return this.calls(filter, options).pop();
	}

	/**
	 * @param {RouteName|RouteName[]} [routeNames]
	 * @returns {boolean}
	 */
	done(routeNames) {
		let routesToCheck = this.router.routes;
		if (routeNames) {
			routeNames = Array.isArray(routeNames) ? routeNames : [routeNames];
			routesToCheck = this.router.routes.filter(({ config: { name } }) =>
				routeNames.includes(name),
			);
		}
		// TODO when checking all routes needs to check against all calls
		// Can't use array.every because would exit after first failure, which would
		// break the logging
		return routesToCheck
			.map(
				/** @type {function(Route):boolean}*/ (route) => {
					const calls = this.callLogs.filter(
						({ route: routeApplied }) => routeApplied === route,
					);
					if (!calls.length) {
						console.warn(`Warning: ${route.config.name} not called`); // eslint-disable-line
						return false;
					}

					const expectedTimes = route.config.repeat;

					if (!expectedTimes) {
						return true;
					}
					const actualTimes = calls.length;

					if (expectedTimes > actualTimes) {
						console.warn(
							`Warning: ${route.config.name} only called ${actualTimes} times, but ${expectedTimes} expected`,
						); // eslint-disable-line
						return false;
					}
					return true;
				},
			)
			.every((isDone) => isDone);
	}
}
export default CallHistory;
