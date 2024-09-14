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
	['overwriteRoutes', 'warnOnFallback', 'sendAsJson'].forEach((optionName) => {
		describe(optionName, () => {
			it('Removes as global option when setting directly as property', () => {
				expectCodemodResult(`fetchMock.config.${optionName} = true`, '');
			});
			it('Removes as global option when using Object.assign', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: true})`,
					'',
				);
			});
			it('Removes as global option when using Object.assign alongside other options', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: true, other: 'value'})`,
					`Object.assign(fetchMock.config, {
  other: 'value'
})`,
				);
			});
			it.skip('Removes as global option when using spread', () => {
				// implement if there is demand
			});

			[
				'sticky',
				'once',
				'get',
				'getOnce',
				'post',
				'postOnce',
				'put',
				'putOnce',
				'delete',
				'deleteOnce',
				'head',
				'headOnce',
				'patch',
				'patchOnce',
				'any',
				'anyOnce',
				// although the src doesn't actually handle these explicitly,
				// these tests ensure that the renaming of these methods to ones that
				// do get handled happens first
				'getAnyOnce:getOnce',
				'mock:route',
			].forEach((methods) => {
				const [methodName, newMethodName = methodName] = methods.split(':');
				describe(`when using ${methodName}`, () => {
					if (methodName === 'getAnyOnce') {
						it(`Removes as option on third parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.getAnyOnce(200, {name: 'rio', ${optionName}: true})`,
								`fetchMock.getOnce("*", 200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.getAnyOnce(200, {${optionName}: true})`,
								`fetchMock.getOnce("*", 200)`,
							);
						});
					} else if (/any/.test(methodName)) {
						it(`Removes as option on third parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}(200, {name: 'rio', ${optionName}: true})`,
								`fetchMock.${newMethodName}(200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}(200, {${optionName}: true})`,
								`fetchMock.${newMethodName}(200)`,
							);
						});
					} else {
						it(`Removes as option on first parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}({url: '*', response: 200, ${optionName}: true})`,
								`fetchMock.${newMethodName}({
  url: '*',
  response: 200
})`,
							);
						});
						it(`Removes as option on third parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}('*', 200, {name: 'rio', ${optionName}: true})`,
								`fetchMock.${newMethodName}('*', 200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}('*', 200, {${optionName}: true})`,
								`fetchMock.${newMethodName}('*', 200)`,
							);
						});
					}
				});
			});
		});
		describe('acting on combinations of the 3 options together', () => {
			it('Removes as global option when using Object.assign', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {sendAsJson: true, overwriteRoutes: true})`,
					'',
				);
			});
			it('Removes as global option when using Object.assign alongside other options', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {sendAsJson: true, overwriteRoutes: true, other: 'value'})`,
					`Object.assign(fetchMock.config, {
  other: 'value'
})`,
				);
			});

			it(`Removes as option on third parameter of getAnyOnce()`, () => {
				expectCodemodResult(
					`fetchMock.getAnyOnce(200, {name: 'rio', sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.getOnce("*", 200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of getAnyOnce() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.getAnyOnce(200, {sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.getOnce("*", 200)`,
				);
			});
			it(`Removes as option on third parameter of any()`, () => {
				expectCodemodResult(
					`fetchMock.any(200, {name: 'rio', sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.any(200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of any() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.any(200, {sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.any(200)`,
				);
			});
			it(`Removes as option on first parameter of get()`, () => {
				expectCodemodResult(
					`fetchMock.get({url: '*', response: 200, sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.get({
  url: '*',
  response: 200
})`,
				);
			});
			it(`Removes as option on third parameter of get()`, () => {
				expectCodemodResult(
					`fetchMock.get('*', 200, {name: 'rio', sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.get('*', 200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of get() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.get('*', 200, {sendAsJson: true, overwriteRoutes: true})`,
					`fetchMock.get('*', 200)`,
				);
			});
		});
	});
	describe('fallbackToNetwork', () => {
		// try to replace fallbackToNetwork: always with spyGlobal()... but probably just insert an error / comment that points at the docs
	});
});
