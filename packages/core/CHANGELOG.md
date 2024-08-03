# Changelog

## [0.4.8](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.7...core-v0.4.8) (2024-08-03)


### Documentation Changes

* document and test behaviour with multiple missing headers ([88d0440](https://github.com/wheresrhys/fetch-mock/commit/88d0440b814a0f3309f49c30d6c81d899ebc65a6))

## [0.4.7](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.6...core-v0.4.7) (2024-08-02)


### Bug Fixes

* correct types so that global optiosn can be passed in to route ([13e1fc6](https://github.com/wheresrhys/fetch-mock/commit/13e1fc64ca3a36f54765d588dc61d44cc92cd413))

## [0.4.6](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.5...core-v0.4.6) (2024-07-30)


### Bug Fixes

* now more spec compliant on exceptions ([ceec07f](https://github.com/wheresrhys/fetch-mock/commit/ceec07f1c8c1be86111b4feaaab76c103885da4d))

## [0.4.5](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.4...core-v0.4.5) (2024-07-26)


### Features

* allow spying on just one route ([a9638fc](https://github.com/wheresrhys/fetch-mock/commit/a9638fc12f60bfa28e6169a9fa736e2bbdc21a8a))
* rename restoreGlobal to unmockGlobal ([3ad4241](https://github.com/wheresrhys/fetch-mock/commit/3ad4241f409353ac970cf26b1252b32ea6390208))

## [0.4.4](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.3...core-v0.4.4) (2024-07-25)


### Features

* cancel readable streams as effectively as possible ([aa3b899](https://github.com/wheresrhys/fetch-mock/commit/aa3b89989bd223e788db895b03c4fabc56f061d2))
* support multiple url matchers at once ([c83d9f9](https://github.com/wheresrhys/fetch-mock/commit/c83d9f992337eb6ff79f027a7fc2e6316ce36456))

## [0.4.3](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.2...core-v0.4.3) (2024-07-24)


### Bug Fixes

* make a more sensible decision about matching body ([0ef50d6](https://github.com/wheresrhys/fetch-mock/commit/0ef50d62ccaa70ea09b693519ddb80d73530b38f))

## [0.4.2](https://github.com/wheresrhys/fetch-mock/compare/core-v0.4.1...core-v0.4.2) (2024-07-24)


### Features

* make query parameters available on CallLog ([8ec57ac](https://github.com/wheresrhys/fetch-mock/commit/8ec57acdc2586102fc94a76f3f3328422e43947f))

## [0.4.0](https://github.com/wheresrhys/fetch-mock/compare/core-v0.3.1...core-v0.4.0) (2024-07-24)


### ⚠ BREAKING CHANGES

* defined route shorthand methods more declaratively

### refactor

* defined route shorthand methods more declaratively ([f42d240](https://github.com/wheresrhys/fetch-mock/commit/f42d240f8ef5c6a270ee8b355ad5177d8fdadf0b)). This includes removing all the `${method}Any()` and `${method}AnyOnce()` methods.

## [0.3.1](https://github.com/wheresrhys/fetch-mock/compare/core-v0.3.0...core-v0.3.1) (2024-07-23)


### Documentation Changes

* fixed tests and documented the async behaviour ([664a6df](https://github.com/wheresrhys/fetch-mock/commit/664a6df59a77937e18f19aa161ec4900fa709bfe))

## [0.3.0](https://github.com/wheresrhys/fetch-mock/compare/core-v0.2.0...core-v0.3.0) (2024-07-21)


### ⚠ BREAKING CHANGES

* matchers now take normalized requests as input
* renamed func to matcherFunction
* removed support for passing in a matcher under the generic name matcher
* renamed functionMatcher to func

### refactor

* matchers now take normalized requests as input ([da9dfe8](https://github.com/wheresrhys/fetch-mock/commit/da9dfe80475f2c95ea9a3652bfe8682ccd4c65fd))


### Features

* can now access express parameters in responses ([41e2475](https://github.com/wheresrhys/fetch-mock/commit/41e2475d64d909f5fb686f2fe3709243326f2dba))
* removed support for passing in a matcher under the generic name matcher ([f41d8f9](https://github.com/wheresrhys/fetch-mock/commit/f41d8f909350961e40a4df9dfb4817a3eaba09cd))
* renamed func to matcherFunction ([e5679a7](https://github.com/wheresrhys/fetch-mock/commit/e5679a72f663d5187d08934aa510951f1d438adc))
* renamed functionMatcher to func ([4cee629](https://github.com/wheresrhys/fetch-mock/commit/4cee629b36cd618d6d5b1061c15e48aab7047969))
* response builder function now expects a calllog ([306357d](https://github.com/wheresrhys/fetch-mock/commit/306357db486c9c7aa621f430cd08621420efc724))

## [0.2.0](https://github.com/wheresrhys/fetch-mock/compare/core-v0.1.1...core-v0.2.0) (2024-07-20)


### ⚠ BREAKING CHANGES

* removed top level done and flush methods

### Features

* removed top level done and flush methods ([49ae6f7](https://github.com/wheresrhys/fetch-mock/commit/49ae6f7671a2ce10f0a31bafd3eb9e1d7ce5cf2d))


### Bug Fixes

* callhistory created with instance.config, not this.config ([87206e6](https://github.com/wheresrhys/fetch-mock/commit/87206e69e71e1270932fe322c79f0b42cac486c6))

## [0.1.1](https://github.com/wheresrhys/fetch-mock/compare/core-v0.1.0...core-v0.1.1) (2024-07-18)


### Features

* **wip:** replace dequal, glob-to-regexp and bump path-to-regexp ([d8d8b25](https://github.com/wheresrhys/fetch-mock/commit/d8d8b259fffbd01a03d5c5bf2768ee48797b68bb))


### Bug Fixes

* replace path-to-regexp with regexparam ([4bf3e32](https://github.com/wheresrhys/fetch-mock/commit/4bf3e32f852ffc169ca354288eff86737e131480))

## 0.1.0 (2024-07-15)


### Bug Fixes

* install core package dependencies ([9c73e76](https://github.com/wheresrhys/fetch-mock/commit/9c73e76686427237a99ababa44075ca426b22037))
