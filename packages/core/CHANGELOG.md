# Changelog

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
