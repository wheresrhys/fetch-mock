---
sidebar_label: 'fetch-mock'
sidebar_position: 1
---

# fetch-mock

This library implements three main features

1. A function, `fetchHandler`, that can be used as a drop in replacement for fetch.
2. A set of chainable API methods for adding routes to `fetchHandler`, which alter how it handles different requests.
3. Some low level APIs for accessing the call history of `fetchHandler` (these are not intended for direct use by the developer, but expose enough information for other libraries, such as `@fetch-mock/jest`, to provide more user friendly APIs built on top of this low level functionality).

`@fetch-mock/core` is not intended for direct use in tests. It **DOES NOT** actually replace your `fetch` implementation with `fetchHandler`; this is left to wrapper libraries such as `@fetch-mock/jest`. This is because different testing frameworks have different opinions about this behaviour, and this core library deliberately avoids making decisions likely to clash with other tools in your testing toolchain, so that the `fetchHandler` implementation is more portable.

```js
import fetchMock from '@fetch-mock/core';
describe('myModule', () => {
	beforeEach(() => fetchMock.mockGlobal())

	it('gets user data from the api endpoint', async () => {
		fetchMock.route({
			express: '/api/users/:user'
			expressParams: {user: 'kenneth'}
		}, {userData: {}}, 'userDataFetch')
		await myModule.initialiseUserPage({user: 'kenneth'})
		expect(fetchMock.called('userDataFetch'))

	})
})

```
