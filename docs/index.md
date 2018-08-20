fetch-mock allows mocking http requests made using fetch, or any one of the many libraries imitating its api such as [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch), [node-fetch](https://www.npmjs.com/package/node-fetch) and [fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill).

The library will run in most JavaScript environments, including nodejs, web workers and service workers, and any browser that either supports fetch natively or that can have a fetch polyfill/ponyfill installed.

As well as shorthand methods for the simplest use cases, it offers a flexible API for customising all aspects of mocking behaviour.

**Uses `async / await` - for older node versions use v5, or require the transpiled version: require('fetch-mock/es5/server')**

<div style="padding: 10px; border: 4px dashed; font-size: 1.2em;">
	I devote a lot of time to maintaining fetch-mock for free. I don't ask for payment, but am raising money for a refugee charity - <a href="https://www.justgiving.com/fundraising/rhys-evans-walk">please consider donating</a>
</div>

## These docs are for v7

- Introduction
- [Quickstart](/fetch-mock/quickstart)
- [Installation and usage ](/fetch-mock/installation)
- [API documentation](/fetch-mock/api)
- [Troubleshooting](/fetch-mock/troubleshooting)
- [Examples](/fetch-mock/examples)

* [V6 - V7 upgrade guide](/fetch-mock/v6-v7-upgrade)
* [V6 docs](/fetch-mock/v6)
* [V5 - V6 upgrade guide](/fetch-mock/v5-v6-upgrade)
* [V5 docs](/fetch-mock/v5)
