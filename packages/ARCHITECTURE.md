# Goals

Completely separate the core behaviour from behaviours that other test libraries may have their own ideas about so that
1. APIs don't have any hard conflicts
2. Within a given ecosystem there is one way to do something, idiomatic to that ecosystem
3. When a new flavour of the month testing library comes along, it's easy to add idiomatic support

# Modules

## fetch handler
- orchestrates building a response and sending it
- Needs to be provided with a router instance
- Puts all details of each call in a CallHistory instance if provided, including which route handled it

## Response builder

## Router
- has a submodule - Route
- given a request finds (if it can) a matching route
- Should provide some debugging info

## CallHistory
- records all fetch calls and provides low level APIs for inspecting them
- API for matching calls should - with the exceotion of respecting route names - behave identically to the router.
- Shodl provide some debugging info

## FetchMock
- Wraps fetch handler, router and inspection together 
- Allows creating instances
- Allows setting options

- DOES NOT DO ANY ACTUAL MOCKING!!! Or maybe there is a very explicit .mockGlobal() method (or ios this in @fetch-mock/standalone?)


FetchMock.createInstance = function () {
	const instance = Object.create(FetchMock);
	instance.router = this.router.clone()
    instance.calls = this.calls.clone()
	return instance;
};

- Where do spy() and pass() live? TBD
- Note that sandbox is gone - complex to implement and a source of many clashes with other testing libraries
## @fetch-mock/standalone, @fetch-mock/jest, @fetch-mock/vitest, ...

Wrappers that act as plugins for the testing libraries' own mocking, inspection and lifecycle management APIs

API split

FetchMock
- config
- createInstance
- bindMethods
- getOption
- flush

FetchHandler
- extractBodyThenHandle
- fetchHandler
- generateResponse
- statusTextMap (but probably doesn't need to be public anyway)

Router
- needsAsyncBodyExtraction
- execute
- addMatcher
- done
- add/route
- get/post/...
- catch
- compileRoute

CallHistory
- recordCall
- filterCalls (private)
- calls
- lastCall

Standalone wrapper
- getNativeFetch
- called
- lastUrl
- lastOptions
- lastResponse
- mockGlobal
- spy??
- pass??
- resetBehavior
- resetHistory
- restore
- reset