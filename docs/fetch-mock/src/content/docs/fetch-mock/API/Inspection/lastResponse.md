---
title: .lastResponse(filter, options)
sidebar:
  label: .lastResponse()
  order: 7
---
Returns the `Response` for the last call to `fetch` matching the given `filter` and `options`. This is an experimental feature, very difficult to implement well given fetch's very private treatment of response bodies. 

If `.lastResponse()` is called before fetch has been resolved then it will return `undefined`

When doing all the following:
- using node-fetch
- responding with a real network response (using spy() or fallbackToNetwork)
- using \`fetchMock.LastResponse()\`
- awaiting the body content  
... the response will hang unless your source code also awaits the response body.
This is an unavoidable consequence of the nodejs implementation of streams.

To obtain json/text responses await the `.json()/.text()` methods of the response

