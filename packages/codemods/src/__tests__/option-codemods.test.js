import { describe, it, expect } from 'vitest';
import { codemod } from '../index';

const prependFetchMock = (src) =>
	`const fetchMock = require('fetch-mock');${src ? '\n' : ''}${src}`;

function expectCodemodResult(src, expected) {
	expect(codemod(prependFetchMock(src))).toEqual(prependFetchMock(expected));
}

describe('codemods operating on options', () => {
	const overwriteTrueErrorString =
		'throw new Error("`overwriteRoutes: true` option is deprecated. Use the `modifyRoute()` method instead")';
	['overwriteRoutes', 'warnOnFallback', 'sendAsJson'].forEach((optionName) => {
		describe(optionName, () => {
			it('Removes as global option when setting directly as property', () => {
				expectCodemodResult(`fetchMock.config.${optionName} = false`, '');
			});
			it('Removes as global option when using Object.assign', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: false})`,
					'',
				);
			});
			it('Removes as global option when using Object.assign alongside other options', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {${optionName}: false, other: 'value'})`,
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
								`fetchMock.getAnyOnce(200, {name: 'rio', ${optionName}: false})`,
								`fetchMock.getOnce("*", 200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.getAnyOnce(200, {${optionName}: false})`,
								`fetchMock.getOnce("*", 200)`,
							);
						});
					} else if (/any/.test(methodName)) {
						it(`Removes as option on third parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}(200, {name: 'rio', ${optionName}: false})`,
								`fetchMock.${newMethodName}(200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}(200, {${optionName}: false})`,
								`fetchMock.${newMethodName}(200)`,
							);
						});
					} else {
						it(`Removes as option on first parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}({url: '*', response: 200, ${optionName}: false})`,
								`fetchMock.${newMethodName}({
  url: '*',
  response: 200
})`,
							);
						});
						it(`Removes as option on third parameter of ${methodName}()`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}('*', 200, {name: 'rio', ${optionName}: false})`,
								`fetchMock.${newMethodName}('*', 200, {
  name: 'rio'
})`,
							);
						});

						it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
							expectCodemodResult(
								`fetchMock.${methodName}('*', 200, {${optionName}: false})`,
								`fetchMock.${newMethodName}('*', 200)`,
							);
						});

						if (optionName === 'overwriteRoutes') {
							describe('overwriteRoutes: true', () => {
								it(`Removes as option on first parameter of ${methodName}()`, () => {
									expectCodemodResult(
										`fetchMock.${methodName}({url: '*', response: 200, ${optionName}: true})`,
										`fetchMock.${newMethodName}({
  url: '*',
  response: 200
})${overwriteTrueErrorString}`,
									);
								});
								it(`Removes as option on third parameter of ${methodName}()`, () => {
									expectCodemodResult(
										`fetchMock.${methodName}('*', 200, {name: 'rio', ${optionName}: true})`,
										`fetchMock.${newMethodName}('*', 200, {
  name: 'rio'
})${overwriteTrueErrorString}`,
									);
								});

								it(`Removes third parameter of ${methodName}() if no other options remain`, () => {
									expectCodemodResult(
										`fetchMock.${methodName}('*', 200, {${optionName}: true})`,
										`fetchMock.${newMethodName}('*', 200)${overwriteTrueErrorString}`,
									);
								});
							});
						}
					}
				});
			});
		});
		describe('acting on combinations of the 3 options together', () => {
			it('Removes as global option when using Object.assign', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {sendAsJson: true, overwriteRoutes: false})`,
					'',
				);
			});
			it('Removes as global option when using Object.assign alongside other options', () => {
				expectCodemodResult(
					`Object.assign(fetchMock.config, {sendAsJson: true, overwriteRoutes: false, other: 'value'})`,
					`Object.assign(fetchMock.config, {
  other: 'value'
})`,
				);
			});

			it(`Removes as option on third parameter of getAnyOnce()`, () => {
				expectCodemodResult(
					`fetchMock.getAnyOnce(200, {name: 'rio', sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.getOnce("*", 200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of getAnyOnce() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.getAnyOnce(200, {sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.getOnce("*", 200)`,
				);
			});
			it(`Removes as option on third parameter of any()`, () => {
				expectCodemodResult(
					`fetchMock.any(200, {name: 'rio', sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.any(200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of any() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.any(200, {sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.any(200)`,
				);
			});
			it(`Removes as option on first parameter of get()`, () => {
				expectCodemodResult(
					`fetchMock.get({url: '*', response: 200, sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.get({
  url: '*',
  response: 200
})`,
				);
			});
			it(`Removes as option on third parameter of get()`, () => {
				expectCodemodResult(
					`fetchMock.get('*', 200, {name: 'rio', sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.get('*', 200, {
  name: 'rio'
})`,
				);
			});

			it(`Removes third parameter of get() if no other options remain`, () => {
				expectCodemodResult(
					`fetchMock.get('*', 200, {sendAsJson: true, overwriteRoutes: false})`,
					`fetchMock.get('*', 200)`,
				);
			});
		});
	});
	describe('fallbackToNetwork', () => {
		const errorString =
			'throw new Error("fallbackToNetwork option is deprecated. Use the `spyGlobal()` method instead")';
		it('Removes fallbackToNetwork as global option when setting directly as property', () => {
			expectCodemodResult(
				`fetchMock.config.fallbackToNetwork = true`,
				errorString,
			);
		});
		it('Removes fallbackToNetwork as global option when using Object.assign', () => {
			expectCodemodResult(
				`Object.assign(fetchMock.config, {fallbackToNetwork: true})`,
				errorString,
			);
		});
		it('Removes fallbackToNetwork as global option when using Object.assign alongside other options', () => {
			expectCodemodResult(
				`Object.assign(fetchMock.config, {fallbackToNetwork: true, other: 'value'})`,
				`Object.assign(fetchMock.config, {
  other: 'value'
})${errorString}`,
			);
		});
	});
});
