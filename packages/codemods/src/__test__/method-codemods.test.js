import { describe, it, expect } from 'vitest';
import { codemod } from '../index';
import jscodeshift from 'jscodeshift';

const prependFetchMock = (src, fetchMockVariableName) =>
	`const ${fetchMockVariableName} = require('fetch-mock');\n${src}`;

function expectCodemodResult(
	src,
	expected,
	fetchMockVariableName = 'fetchMock',
) {
	expect(
		codemod(prependFetchMock(src, fetchMockVariableName), jscodeshift),
	).toEqual(prependFetchMock(expected, fetchMockVariableName));
}

describe('codemods operating on methods', () => {
	describe('converting mock() to route()', () => {
		//TODO Next to the first one in a file leave a comment explaining that they need to use mockGlobal() too
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

	// .sandbox() => .fetchHandler(and maybe a comment about.createInstance())
	// restore() / reset()... once I've decided how to implement these
	// lastCall() => try to change uses of this to expect a callLog, but probably just insert a commemnt / error
});
