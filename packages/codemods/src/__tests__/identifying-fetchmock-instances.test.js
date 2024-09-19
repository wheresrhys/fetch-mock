import { describe, it, expect } from 'vitest';
import { codemod } from '../index';
import jscodeshift from 'jscodeshift';

function expectCodemodResult(src, expected) {
	expect(codemod(src, jscodeshift)).toEqual(expected);
}

describe('identifying fetch-mock instances', () => {
	it('cjs require() named fetchMock', () => {
		expectCodemodResult(
			`
const fetchMock = require('fetch-mock');
fetchMock.mock("blah", 200)
`,
			`
const fetchMock = require('fetch-mock');
fetchMock.route("blah", 200)
`,
		);
	});
	it('cjs require() named something else', () => {
		expectCodemodResult(
			`
const fetchNot = require('fetch-mock');
fetchNot.mock("blah", 200)
`,
			`
const fetchNot = require('fetch-mock');
fetchNot.route("blah", 200)
`,
		);
	});
	it('esm import named fetchMock', () => {
		expectCodemodResult(
			`
import fetchMock from 'fetch-mock';
fetchMock.mock("blah", 200)
`,
			`
import fetchMock from 'fetch-mock';
fetchMock.route("blah", 200)
`,
		);
	});
	it('esm import named something else', () => {
		expectCodemodResult(
			`
import fetchNot from 'fetch-mock';
fetchNot.mock("blah", 200)
`,
			`
import fetchNot from 'fetch-mock';
fetchNot.route("blah", 200)
`,
		);
	});
	it.skip('unassigned instances of require("fetch-mock")', () => {
		expectCodemodResult(
			`require('fetch-mock').mock("blah", 200)`,
			`require('fetch-mock').route("blah", 200)`,
		);
	});
	it.skip('sandbox() instances', () => {
		expectCodemodResult(
			`
const fetchMock = require('fetch-mock');
const fm = fetchMock.sandbox();
fm.mock("blah", 200)
`,
			`
const fetchMock = require('fetch-mock');
const fm = fetchMock.sandbox();
fm.route("blah", 200)
`,
		);
	});
	it.skip('sandbox() instances used by jest / vitest.mock', () => {});
	it.skip('identify multiple instances on a page e.g. fetchMock and fm=fetchMock.sandbox()', () => {});
	it.skip('identify when a fm instance with lots of chained methods is assigned to a new variable', () => {
		expectCodemodResult(
			`
const fetchMock = require('fetch-mock');
const fm = fetchMock.get('a', 'b').get('a', 'b');
fm.mock("blah", 200)
`,
			`
const fetchMock = require('fetch-mock');
const fm = fetchMock.get('a', 'b').get('a', 'b');
fm.route("blah", 200)
`,
		);
	});
});
