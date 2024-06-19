FetchHandler.recordCall = function (obj) {
    if (obj) {
        this._calls.push(obj);
    }
};




import { normalizeUrl } from './request-utils.js';
import Route from './Route.js/index.js';

const FetchMock = {};
const isName = (nameOrMatcher) =>
    typeof nameOrMatcher === 'string' && /^[\da-zA-Z\-]+$/.test(nameOrMatcher);

const filterCallsWithMatcher = function (matcher, options = {}, calls) {
    ({ matcher } = new Route([{ matcher, response: 'ok', ...options }], this));
    return calls.filter(({ url, options }) =>
        matcher(normalizeUrl(url), options),
    );
};

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

FetchMock.filterCalls = function (nameOrMatcher, options) {
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
};

FetchMock.calls = function (nameOrMatcher, options) {
    return this.filterCalls(nameOrMatcher, options);
};

FetchMock.lastCall = function (nameOrMatcher, options) {
    return [...this.filterCalls(nameOrMatcher, options)].pop();
};

FetchMock.lastUrl = function (nameOrMatcher, options) {
    return (this.lastCall(nameOrMatcher, options) || [])[0];
};

FetchMock.lastOptions = function (nameOrMatcher, options) {
    return (this.lastCall(nameOrMatcher, options) || [])[1];
}

FetchMock.lastResponse = function (nameOrMatcher, options) {
    const { response } = this.lastCall(nameOrMatcher, options) || [];
    try {
        const clonedResponse = response.clone();
        return clonedResponse;
    } catch (err) {
        Object.entries(response._fmResults).forEach(([name, result]) => {
            response[name] = () => result;
        });
        return response;
    }
};

FetchMock.called = function (nameOrMatcher, options) {
    return Boolean(this.filterCalls(nameOrMatcher, options).length);
};


FetchMock.done = function (nameOrMatcher) {
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
};

export default FetchMock;
