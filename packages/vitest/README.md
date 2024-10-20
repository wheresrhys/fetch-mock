# @fetch-mock/vitest

A wrapper for fetch-mock that improves the developer experience when working with vitest. It provides the following:

- Adds methods to fetchMock which wrap its default methods, but align more closely with vitest's naming conventions.
- Extends `expect` with convenience methods allowing for expressive tests such as `expect(fetchMock).toHavePosted('http://example.com', {id: 'test-id'})`.
- Can optionally be hooked in to vitest's global mock management methods such as `clearAllMocks()`.

## Requirements

@fetch-mock/vitest requires either of the following to run:

- [vitest](https://vitest.dev/guide/)
- The `fetch` API, via one of the following:
  - [Node.js](https://nodejs.org/) 18+ for full feature operation
  - Any modern browser that supports the `fetch` API
  - [node-fetch](https://www.npmjs.com/package/node-fetch) when testing in earlier versions of Node.js (this is untested, but should mostly work)

## Documentation and Usage

See the [project website](https://www.wheresrhys.co.uk/fetch-mock/docs/wrappers/vitest/)

## License

@fetch-mock/vitest is licensed under the [MIT](https://github.com/wheresrhys/fetch-mock/blob/master/LICENSE) license.
Copyright © 2024, Rhys Evans
