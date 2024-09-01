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

	//
	// .lastOptions() => .callHistory.lastCall()?.options
	// .lastResponse() => .callHistory.lastCall()?.response
	// .sandbox() => .fetchHandler(and maybe a comment about.createInstance())
	// .getAny(), .postAny(), .putAny(), .deleteAny(), .headAny(), .patchAny(), .getAnyOnce(), .postAnyOnce(), .putAnyOnce(), .deleteAnyOnce(), .headAnyOnce(), .patchAnyOnce() => calls to the underlying method + options
	// restore() / reset()... once I've decided how to implement these
	// lastCall() => try to change uses of this to expect a callLog, but probably just insert a commemnt / error
});
