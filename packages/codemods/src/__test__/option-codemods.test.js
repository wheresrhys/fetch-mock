import { describe, it, expect } from 'vitest';
import { codemod } from '../index';
import jscodeshift from 'jscodeshift';

const prependFetchMock = (src) =>
	`const fetchMock = require('fetch-mock');${src ? '\n' : ''}${src}`;

function expectCodemodResult(src, expected) {
	expect(codemod(prependFetchMock(src), jscodeshift)).toEqual(
		prependFetchMock(expected),
	);
}

describe('codemods operating on options', () => {
	[
		'overwriteRoutes',
		// ,
		//  'warnOnFallback', 'sendAsJson'
	].forEach((optionName) => {
		describe(optionName, () => {
			it('Removes as global option when setting directly as property', () => {
				expectCodemodResult(`fetchMock.config.${optionName} = true`, '');
			});
			it('Removes as global option when using Object.assign', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: true})`,
					`Object.assign(fetchMock.config, {})`,
				);
			});
			it('Removes as global option when using Object.assign alongside other options', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: true, other: 'value'})`,
					`Object.assign(fetchMock.config, {other: 'value'})`,
				);
			});
			it.skip('Removes as global option when using spread', () => {
				// implement if there is demand
			});

			[
				'mock',
				// 'sticky',
				// 'once',
				// 'any',
				// 'anyOnce',
				// 'get',
				// 'getAny',
				// 'getOnce',
				// 'getAnyOnce',
				// 'post',
				// 'postAny',
				// 'postOnce',
				// 'postAnyOnce',
				// 'put',
				// 'putAny',
				// 'putOnce',
				// 'putAnyOnce',
				// 'delete',
				// 'deleteAny',
				// 'deleteOnce',
				// 'deleteAnyOnce',
				// 'head',
				// 'headAny',
				// 'headOnce',
				// 'headAnyOnce',
				// 'patch',
				// 'patchAny',
				// 'patchOnce',
				// 'patchAnyOnce'
			].forEach((methodName) => {
				describe(`when using ${methodName}`, () => {
					it(`Removes as option on first parameter of ${methodName}()`, () => {});

					it(`Removes as option on third parameter of ${methodName}()`, () => {});

					it(`Removes third parameter of ${methodName}() if no other options remain`, () => {});
				});
			});
		});
	});
	describe('fallbackToNetwork', () => {
		// try to replace fallbackToNetwork: always with spyGlobal()... but probably just insert an error / comment that points at the docs
	});
});
