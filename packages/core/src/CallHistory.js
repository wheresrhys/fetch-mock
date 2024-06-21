import { normalizeUrl } from './request-utils.js';
import Route from './Route.js/index.js';


const isName = (nameOrMatcher) =>
	typeof nameOrMatcher === 'string' && /^[\da-zA-Z\-]+$/.test(nameOrMatcher);



const callObjToArray = (obj) => {
	if (!obj) {
		return undefined;
	}
	const { url, options, request, identifier, isUnmatched, response } = obj;
	const arr = [url, options];
	arr.request = request;
	arr.identifier = identifier;
	arr.isUnmatched = isUnmatched;
	arr.response = response;
	return arr;
};

class CallHistory {
	constructor ()
	recordCall (obj) {
		if (obj) {
			this.calls.push(obj);
		}
	}
	filterCallsWithMatcher (matcher, options = {}, calls) {
		({ matcher } = new Route([{ matcher, response: 'ok', ...options }], this));
		return calls.filter(({ url, options }) =>
			matcher(normalizeUrl(url), options),
		);
	}
	flush async (waitForResponseMethods) {
		const queuedPromises = this.holdingPromises;
		this.holdingPromises = [];

		await Promise.all(queuedPromises);
		if (waitForResponseMethods && this.holdingPromises.length) {
			await this.flush(waitForResponseMethods);
		}
	}

	filterCalls (nameOrMatcher, options) {
		let calls = this._calls;
		let matcher = '*';

		if ([true, 'matched'].includes(nameOrMatcher)) {
			calls = calls.filter(({ isUnmatched }) => !isUnmatched);
		} else if ([false, 'unmatched'].includes(nameOrMatcher)) {
			calls = calls.filter(({ isUnmatched }) => isUnmatched);
		} else if (typeof nameOrMatcher === 'undefined') {
		} else if (isName(nameOrMatcher)) {
			calls = calls.filter(({ identifier }) => identifier === nameOrMatcher);
		} else {
			matcher = nameOrMatcher === '*' ? '*' : normalizeUrl(nameOrMatcher);
			if (this.routes.some(({ identifier }) => identifier === matcher)) {
				calls = calls.filter((call) => call.identifier === matcher);
			}
		}

		if ((options || matcher !== '*') && calls.length) {
			if (typeof options === 'string') {
				options = { method: options };
			}
			calls = filterCallsWithMatcher.call(this, matcher, options, calls);
		}
		return calls.map(callObjToArray);
	}

	calls (nameOrMatcher, options) {
		return this.filterCalls(nameOrMatcher, options);
	}

	called(nameOrMatcher, options) {
		return Boolean(this.calls(nameOrMatcher, options).length);
	}

	lastCall (nameOrMatcher, options) {
		return [...this.filterCalls(nameOrMatcher, options)].pop();
	}

	done (nameOrMatcher) {
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
