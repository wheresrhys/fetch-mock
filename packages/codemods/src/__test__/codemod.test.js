import {describe, it, expect} from 'vitest';
import {codemod} from '../index';
import jscodeshift from 'jscodeshift';

const prependFetchMock = src => `const fetchMock = require('fetch-mock');\n${src}`;

function expectCodemodResult (src, expected) {
	expect(codemod(prependFetchMock(src), jscodeshift)).toEqual(prependFetchMock(expected))
}

describe('codemod', () => {
	describe('converting mock() to route()', () => {
		it('single .mock()', () => {
			expectCodemodResult('fetchMock.mock("blah", 200)','fetchMock.route("blah", 200)');
		});
		it('multiple single .mock()', () => {
			expectCodemodResult(`
				fetchMock.mock("blah", 200);
				fetchMock.mock("bloop", 300);
			`,`
				fetchMock.route("blah", 200);
				fetchMock.route("bloop", 300);
			`);
		});
		it('chained .mock()', () => {
			expectCodemodResult(`
				fetchMock
					.mock("blah", 200)
					.mock("bloop", 300)
				`,`
				fetchMock
					.route("blah", 200)
					.route("bloop", 300)
				`);
		});
		it('chained .mock() after other method', () => {
			expectCodemodResult(`
				fetchMock
					.get("blah", 200)
					.mock("bloop", 300)
				`,`
				fetchMock
					.get("blah", 200)
					.route("bloop", 300)
				`);
		});

	})
})
