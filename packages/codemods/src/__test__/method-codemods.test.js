import { describe, it, expect } from 'vitest';
import { codemod } from '../index';

const prependFetchMock = (src, fetchMockVariableName) =>
	`const ${fetchMockVariableName} = require('fetch-mock');\n${src}`;

function expectCodemodResult(
	src,
	expected,
	fetchMockVariableName = 'fetchMock',
) {
	expect(codemod(prependFetchMock(src, fetchMockVariableName))).toEqual(
		prependFetchMock(expected, fetchMockVariableName),
	);
}

describe('codemods operating on methods', () => {
	describe('converting mock() to route()', () => {
		it('single .mock()', () => {
			expectCodemodResult(
				'fetchMock.mock("blah", 200)',
				'fetchMock.route("blah", 200)',
			);
		});
		it('multiple single .mock()', () => {
			expectCodemodResult(
				`
				fetchMock.mock("blah", 200);
				fetchMock.mock("bloop", 300);
			`,
				`
				fetchMock.route("blah", 200);
				fetchMock.route("bloop", 300);
			`,
			);
		});
		it('chained .mock()', () => {
			expectCodemodResult(
				`
				fetchMock
					.mock("blah", 200)
					.mock("bloop", 300)
				`,
				`
				fetchMock
					.route("blah", 200)
					.route("bloop", 300)
				`,
			);
		});
		it('chained .mock() after other method', () => {
			expectCodemodResult(
				`
				fetchMock
					.get("blah", 200)
					.mock("bloop", 300)
				`,
				`
				fetchMock
					.get("blah", 200)
					.route("bloop", 300)
				`,
			);
		});
	});

	describe('converting resetting methods', () => {
		it('rewrites restore()', () => {
			expectCodemodResult(
				'fetchMock.restore()',
				`fetchMock.clearHistory();
fetchMock.removeRoutes();
fetchMock.unmockGlobal();`,
			);
		});
		it('rewrites restore() with {sticky: true}', () => {
			expectCodemodResult(
				'fetchMock.restore({sticky: true})',
				`fetchMock.clearHistory();
fetchMock.removeRoutes({includeSticky: true});
fetchMock.unmockGlobal();`,
			);
		});
		it('rewrites reset()', () => {
			expectCodemodResult(
				'fetchMock.reset()',
				`fetchMock.clearHistory();
fetchMock.removeRoutes();
fetchMock.unmockGlobal();`,
			);
		});
		it('rewrites reset() with {sticky: true}', () => {
			expectCodemodResult(
				'fetchMock.reset({sticky: true})',
				`fetchMock.clearHistory();
fetchMock.removeRoutes({includeSticky: true});
fetchMock.unmockGlobal();`,
			);
		});

		it('rewrites resetBehavior()', () => {
			expectCodemodResult(
				'fetchMock.resetBehavior()',
				`fetchMock.removeRoutes();
fetchMock.unmockGlobal();`,
			);
		});
		it('rewrites resetBehavior() with {sticky: true}', () => {
			expectCodemodResult(
				'fetchMock.resetBehavior({sticky: true})',
				`fetchMock.removeRoutes({includeSticky: true});
fetchMock.unmockGlobal();`,
			);
		});
		it('rewrites resetHistory()', () => {
			expectCodemodResult(
				'fetchMock.resetHistory()',
				'fetchMock.clearHistory()',
			);
		});
	});
	describe('warning about CallLog', () => {
		it('lastCall()', () => {
			expectCodemodResult(
				'fetchMock.lastCall()',
				`throw new Error("lastCall() now returns a CallLog object instead of an array. Refer to the documentation")
fetchMock.lastCall()`,
			);
		});
		it('calls()', () => {
			expectCodemodResult(
				'fetchMock.calls()',
				`throw new Error("calls() now returns an array of CallLog objects instead of an array of arrays. Refer to the documentation")
fetchMock.calls()`,
			);
		});
	});
	describe('converting lastUrl()', () => {
		it('single .lastUrl()', () => {
			expectCodemodResult(
				'fetchMock.lastUrl()',
				'fetchMock.callHistory.lastCall()?.url',
			);
		});
		it('lastUrl() with arguments', () => {
			expectCodemodResult(
				`fetchMock.lastUrl('name', {method: 'get'})`,
				`fetchMock.callHistory.lastCall('name', {method: 'get'})?.url`,
			);
		});

		it('works with other names for fetch-mock', () => {
			expectCodemodResult(
				`fm.lastUrl('name', {method: 'get'})`,
				`fm.callHistory.lastCall('name', {method: 'get'})?.url`,
				'fm',
			);
		});
	});

	describe('converting lastOptions()', () => {
		it('single .lastOptions()', () => {
			expectCodemodResult(
				'fetchMock.lastOptions()',
				'fetchMock.callHistory.lastCall()?.options',
			);
		});
		it('lastOptions() with arguments', () => {
			expectCodemodResult(
				`fetchMock.lastOptions('name', {method: 'get'})`,
				`fetchMock.callHistory.lastCall('name', {method: 'get'})?.options`,
			);
		});

		it('works with other names for fetch-mock', () => {
			expectCodemodResult(
				`fm.lastOptions('name', {method: 'get'})`,
				`fm.callHistory.lastCall('name', {method: 'get'})?.options`,
				'fm',
			);
		});
	});

	describe('converting lastResponse()', () => {
		it('single .lastResponse()', () => {
			expectCodemodResult(
				'fetchMock.lastResponse()',
				'fetchMock.callHistory.lastCall()?.response',
			);
		});
		it('lastResponse() with arguments', () => {
			expectCodemodResult(
				`fetchMock.lastResponse('name', {method: 'get'})`,
				`fetchMock.callHistory.lastCall('name', {method: 'get'})?.response`,
			);
		});

		it('works with other names for fetch-mock', () => {
			expectCodemodResult(
				`fm.lastResponse('name', {method: 'get'})`,
				`fm.callHistory.lastCall('name', {method: 'get'})?.response`,
				'fm',
			);
		});
	});

	['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
		describe(`${method}Any() -> ${method}("*")`, () => {
			it('when only has response', () => {
				expectCodemodResult(
					`fetchMock.${method}Any(200)`,
					`fetchMock.${method}("*", 200)`,
				);
			});
			it('when has additional options', () => {
				expectCodemodResult(
					`fetchMock.${method}Any(200, {name: "my-route"})`,
					`fetchMock.${method}("*", 200, {name: "my-route"})`,
				);
			});
			it('when has name', () => {
				expectCodemodResult(
					`fetchMock.${method}Any(200, "my-route")`,
					`fetchMock.${method}("*", 200, "my-route")`,
				);
			});
		});
		describe(`${method}AnyOnce() -> ${method}Once("*")`, () => {
			it('when only has response', () => {
				expectCodemodResult(
					`fetchMock.${method}AnyOnce(200)`,
					`fetchMock.${method}Once("*", 200)`,
				);
			});
			it('when has additional options', () => {
				expectCodemodResult(
					`fetchMock.${method}AnyOnce(200, {name: "my-route"})`,
					`fetchMock.${method}Once("*", 200, {name: "my-route"})`,
				);
			});
			it('when has name', () => {
				expectCodemodResult(
					`fetchMock.${method}AnyOnce(200, "my-route")`,
					`fetchMock.${method}Once("*", 200, "my-route")`,
				);
			});
		});
	});
});
