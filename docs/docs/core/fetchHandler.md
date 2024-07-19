---
sidebar_position: 1
sidebar_label: .fetchHandler
---
# fetchHandler

`fetchMock.fetchHandler(url, requestInit)`

A mock implementation of `fetch`.

By default it will error. In order to return responses `.route()`, `.catch()` and other convenience methods of `fetchMock` must first be used to add routes to its internal router.

All calls made using `fetchMock.fetchHandler` are recorded in `fetchMock.callHistory`
