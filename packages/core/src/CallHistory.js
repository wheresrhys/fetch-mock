//@type-check
/** @typedef {import('./Route.js').RouteConfig} RouteConfig */
/** @typedef {import('./Route.js').RouteName} RouteName */
/** @typedef {import('./RequestUtils.js').NormalizedRequestOptions} NormalizedRequestOptions */
/** @typedef {import('./Matchers.js').RouteMatcher} RouteMatcher */
/** @typedef {import('./FetchMock.js').FetchMockConfig} FetchMockConfig */
import { createCallLogFromUrlAndOptions } from './RequestUtils.js';
import { isUrlMatcher } from './Matchers.js';
import Route from './Route.js';
import Router from './Router.js';

/**
 * @typedef CallLog
 * @property {any[]} arguments
 * @property {string} url
 * @property {NormalizedRequestOptions} options
 * @property {Request} [request]
 * @property {AbortSignal} [signal]
 * @property {Route} [route]
 * @property {Response} [response]
 * @property {Object.<string, string>} [expressParams]
 * @property {URLSearchParams} [queryParams]
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
	 * @param {Router} router
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

	/**
	 * @returns {void}
	 */
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
				options = { url: filter, ...(options || {}) };
			} else {
				options = { ...filter, ...(options || {}) };
			}
		}

		const { matcher } = new Route({
			response: 'ok',
			...options,
		});

		calls = calls.filter(({ url, options }) => {
			return matcher(createCallLogFromUrlAndOptions(url, options));
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
