# Changelog

## [0.1.0](https://github.com/wheresrhys/fetch-mock/compare/codemods-v0.1.0...codemods-v0.1.0) (2024-09-25)


### Documentation Changes

* fix mistakes in codemods docs ([315365e](https://github.com/wheresrhys/fetch-mock/commit/315365e86b7e15d5bc725cd61dd8b1893f7c5fad))

## 0.1.0 (2024-09-19)


### Features

* add an error to warn of calls() signature change ([5bf6f67](https://github.com/wheresrhys/fetch-mock/commit/5bf6f6765fe54a2eb0e1cc9424df02b721b9610c))
* add an error to warn of lastCall() signature change ([62fc48c](https://github.com/wheresrhys/fetch-mock/commit/62fc48c8cce70267fe044088ca6cafab4139766c))
* allow manually specifying extra variables that hold fetch-mock instances ([317ede7](https://github.com/wheresrhys/fetch-mock/commit/317ede7ea305fd9df9c498444df2b7a0e1350449))
* can identify fetch mock in esm ([e523711](https://github.com/wheresrhys/fetch-mock/commit/e523711b5c05e2adeea96a4478c681c603b329b4))
* codemod fro fallbackToNetwork option ([c272f65](https://github.com/wheresrhys/fetch-mock/commit/c272f65e903e6e835edbf3a087def0aded796b30))
* codemod reset() ([a96f62b](https://github.com/wheresrhys/fetch-mock/commit/a96f62b60e95e691dd0f783de419db01a1b92302))
* codemod resetHistory to clearHistory ([5f1203e](https://github.com/wheresrhys/fetch-mock/commit/5f1203ebfcc173e3293c61e24c7348c5810f1a2e))
* codemod restore() ([21e54af](https://github.com/wheresrhys/fetch-mock/commit/21e54afbd6eeb47aff1cff4f9ac367b89da4198f))
* converted codemods to use tsx parser for greater reuse ([376d5c3](https://github.com/wheresrhys/fetch-mock/commit/376d5c3de38a74f38b320f8b3dacffec44993861))
* finished implementing reset method codemods ([e9d59df](https://github.com/wheresrhys/fetch-mock/commit/e9d59dff405625289eb1378a7943d1cde1950125))
* first codemod for editing an option implemented ([6ec5575](https://github.com/wheresrhys/fetch-mock/commit/6ec55750ce0eeb1a79ce3559c7d25dbaf9919650))
* lastOptions() and lastResponse() ([300e0b8](https://github.com/wheresrhys/fetch-mock/commit/300e0b83e0bd5be40c975ace46af86166b7c75e1))
* lastUrl() codemod implemented ([a115a27](https://github.com/wheresrhys/fetch-mock/commit/a115a2733defc8dbca0554abfaa25750daa9f8fe))
* midway through implementing codemods for sandbox ([dbb0b43](https://github.com/wheresrhys/fetch-mock/commit/dbb0b431b8d1894d032236199ae206f7790dbb2a))
* more option codemods ([23201b0](https://github.com/wheresrhys/fetch-mock/commit/23201b0f3ff34f04ae80152847d35d228550ca31))
* progress on codemod to alter global options ([f790205](https://github.com/wheresrhys/fetch-mock/commit/f7902051c992c869f34481959fef8e59468a7f6d))
* remiving options from methods more or less works ([e976e7e](https://github.com/wheresrhys/fetch-mock/commit/e976e7edc87927d66570ca41c1a10187d22566e5))
* remove codemods for sandbox() method ([9a06c1e](https://github.com/wheresrhys/fetch-mock/commit/9a06c1e4386b8d4c33f6b7fea50be49634308fb4))
* set up basic codemods package structure ([a76cee9](https://github.com/wheresrhys/fetch-mock/commit/a76cee9887d4e2bd56cdb0564ca787190f028aff))
* support converting getAny() etc ([1ef70ec](https://github.com/wheresrhys/fetch-mock/commit/1ef70ec9bfc7364712f900655bd6f194e2c45b0a))
* use get("*") as a better replacement for getAny() ([3b7daf7](https://github.com/wheresrhys/fetch-mock/commit/3b7daf71663662265c63169ba036b13e0856b053))


### Bug Fixes

* avoided converting jest.mock() to jest.route() ([a42817b](https://github.com/wheresrhys/fetch-mock/commit/a42817b392cc035653f0be149a6d51b0dcc53de4))
* changed to use j.ObjectProperty instead of j.Property ([78c2e35](https://github.com/wheresrhys/fetch-mock/commit/78c2e3541e0be25d267ea47c28ee53641634ce4a))
* defined types for codemod ([0c3debf](https://github.com/wheresrhys/fetch-mock/commit/0c3debf039d052a92de590cce3ca9d772a76a880))
* reinstated codemods for options on all methods ([3a610b7](https://github.com/wheresrhys/fetch-mock/commit/3a610b7fce666cb2954715d28c2732ccbabcb960))


### Documentation Changes

* document how to use transform with jodeshift ([517a6ac](https://github.com/wheresrhys/fetch-mock/commit/517a6ac297e1d5c5bad194a771fa4e1419bd10ad))
* start documenting usage of codemods ([f4a3c39](https://github.com/wheresrhys/fetch-mock/commit/f4a3c39de4540c7338d65ca59636b413bef11964))
