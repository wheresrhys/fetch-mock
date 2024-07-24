# @fetch-mock/standalone

Wrapper around @fetch-mock/core that implements mocking of global fetch, including spying on and falling through to the native fetch implementation.

In addition to the @fetch-mock/core API its methods are:

## mockGlobal()

Replaces `fetch` with `fm.fetchHandler`

## restoreGlobal()

Restores `fetch` to its original state

## spyGlobal()

Replaces `fetch` with `fm.fetchHandler`, but falls back to the network for any unmatched calls

## spyLocal(fetchImplementation)




mock()
@fetch-mock/core does not implement any functionality for replacing global fetch or a local fetch implementation (such as node-fetch) with a mock implementation.

.spy()/fallbackToNetwork
As @fetch-mock/core does not do anything to replace the native fetch implementation, these features - which pass through the fetch-mock implementation and go straight to the native implementation - are also concersn that will be added to wrappers.

restore()/reset()
Libraries such as Jest or Vitest have their own APIs for resetting mocks, so @fetch-mock/core deliberately only contains low level APIs for managing routes and call history. These will be wrapped in ways that are idiomatic for different test frameworks.
