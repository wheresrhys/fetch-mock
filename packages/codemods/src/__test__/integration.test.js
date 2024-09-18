import { it, describe, expect } from 'vitest';
import transformer from '../index';

function expectCodemodResult(src, expected) {
	expect(transformer({ source: src })).toEqual(expected);
}

describe('integration', () => {
	it('allow passing in one or more variable names for fetch-mock', () => {
		process.env.FM_VARIABLES = 'fm1,fm2';
		expectCodemodResult(
			`const fetchMock = require('fetch-mock');
fetchMock.mock("blah", 200);
fm1.mock("blah", 200);
fm2.mock("blah", 200);`,
			`const fetchMock = require('fetch-mock');
fetchMock.route("blah", 200);
fm1.route("blah", 200);
fm2.route("blah", 200);`,
		);
	});
	it('can operate on a js file', () => {});
	it('can operate on a ts file', () => {});
	it('can operate on a jsx file', () => {});
	it('can operate on a tsx file', () => {});
});
