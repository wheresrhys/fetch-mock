//@type-check
import { normalizeUrl } from './request-utils.js';
import Route from './Route.js';

/**
 * @typedef CallLog
 * @prop {string} url
 * @prop {NormalizedRequestOptions} options
 * @prop {Request} [request]
 * @prop {Route} [route]
 */

/** @typedef  {string | RouteMatcher} NameOrMatcher*/

/**
 *
 * @param {NameOrMatcher} nameOrMatcher
 * @returns {boolean}
 */
const isName = (nameOrMatcher) =>
	typeof nameOrMatcher === 'string' && /^[\da-zA-Z\-]+$/.test(nameOrMatcher);

class CallHistory {
	constructor() {
		this.callLogs = [];
	}
	/**
	 *
	 * @param {CallLog} callLog
	 */
	recordCall(callLog) {
		this.callLogs.push(callLog);
	}

	/**
	 * 
	 * @param {Promise<any>} promise 
	 */
	addHoldingPromise (promise) {
		this.holdingPromises.push(promise)
	}

	/**
	 *
	 * @param {boolean} waitForResponseBody
	 * @returns {Promise<void>}
	 */
	async flush(waitForResponseBody) {
		const queuedPromises = this.holdingPromises;
		this.holdingPromises = [];

		await Promise.all(queuedPromises);
		if (waitForResponseBody && this.holdingPromises.length) {
			await this.flush(waitForResponseBody);
		}
	}

	/**
	 *
	 * @param {NameOrMatcher} nameOrMatcher
	 * @param {RouteOptions} options
	 * @returns {CallLog[]}
	 */
	filterCalls(nameOrMatcher, options) {
		let calls = [...this.callLogs];
		let matcher = '*';

		if ([true, 'matched'].includes(nameOrMatcher)) {
			calls = calls.filter(({ route }) => Boolean(route));
		} else if ([false, 'unmatched'].includes(nameOrMatcher)) {
			calls = calls.filter(({ route }) => !Boolean(route));
		} else if (typeof nameOrMatcher === 'undefined') {
		} else if (isName(nameOrMatcher)) {
			calls = calls.filter(({ identifier }) => identifier === nameOrMatcher);
		} else {
			matcher = nameOrMatcher === '*' ? '*' : normalizeUrl(nameOrMatcher);
			if (this.routes.some(({ identifier }) => identifier === matcher)) {
				calls = calls.filter((call) => call.identifier === matcher);
			}
		}

		return calls;
	}
	/**
	 *
	 * @param {NameOrMatcher} nameOrMatcher
	 * @param {RouteOptions} options
	 * @returns {CallLog[]}
	 */
	calls(nameOrMatcher, options) {
		return this.filterCalls(nameOrMatcher, options);
	}
	/**
	 *
	 * @param {NameOrMatcher} nameOrMatcher
	 * @param {RouteOptions} options
	 * @returns {Boolean}
	 */
	called(nameOrMatcher, options) {
		return Boolean(this.calls(nameOrMatcher, options).length);
	}
	/**
	 *
	 * @param {NameOrMatcher} nameOrMatcher
	 * @param {RouteOptions} options
	 * @returns {CallLog}
	 */
	lastCall(nameOrMatcher, options) {
		return this.filterCalls(nameOrMatcher, options).pop();
	}
	/**
	 *
	 * @param {NameOrMatcher} nameOrMatcher
	 * @param {RouteOptions} options
	 * @returns {Boolean}
	 */
	done(nameOrMatcher) {
		let routesToCheck;

		if (nameOrMatcher && typeof nameOrMatcher !== 'boolean') {
			routesToCheck = [{ identifier: nameOrMatcher }];
		} else {
			routesToCheck = this.routes;
		}

		// Can't use array.every because would exit after first failure, which would
		// break the logging
		const result = routesToCheck
			.map(({ identifier }) => {
				if (!this.called(identifier)) {
					console.warn(`Warning: ${identifier} not called`); // eslint-disable-line
					return false;
				}

				const expectedTimes = (
					this.routes.find((r) => r.identifier === identifier) || {}
				).repeat;

				if (!expectedTimes) {
					return true;
				}
				const actualTimes = this.filterCalls(identifier).length;

				if (expectedTimes > actualTimes) {
					console.warn(
						`Warning: ${identifier} only called ${actualTimes} times, but ${expectedTimes} expected`,
					); // eslint-disable-line
					return false;
				}
				return true;
			})
			.every((isDone) => isDone);

		return result;
	}
}
export default CallHistory;
