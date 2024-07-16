---
title: 'Inspection fundamentals'
position: 0
description: |-
  Check out the new [cheatsheet](https://github.com/wheresrhys/fetch-mock/blob/master/docs/cheatsheet.md)
  {: .info}

  `fetch-mock`'s inspection methods allow information about how `fetch` was called to be retrieved after your application code has run. Most inspection methods take two arguments — `filter` and `options` — which allow individual, or groups of, `fetch` calls to be extracted and examined.
parameters:
  - name: filter
    content: |-
      Filter calls to `fetch` using one of the following criteria:
    options:
      - types:
          - undefined
        versionAdded: 6.0.0
        content: |-
          Retrieve all calls made to `fetch`
      - types:
          - true
        versionAdded: 6.0.0
        content: |-
          Retrieve all calls to `fetch` matched by some route defined by `fetch-mock`. The string `'matched'` can be used instead of `true` to make tests more readable
        examples:
          - |-
            const {MATCHED, fetchMock} = require('fetch-mock');
            ...
            fetchMock.calls(MATCHED)
      - types:
          - false
        versionAdded: 6.0.0
        content: |-
          Retrieve all calls to `fetch` not matched by some route defined by `fetch-mock`. The string `'unmatched'` can be used instead of `false` to make tests more readable
        examples:
          - |-
            const {UNMATCHED, fetchMock} = require('fetch-mock');
            ...
            fetchMock.calls(UNMATCHED)
      - types:
          - '"matched"'
          - '"unmatched"'
        versionAdded: 9.0.0
        content: Aliases for `true` and `false`
      - name: routeIdentifier
        types:
          - String
          - RegExp
          - function
        versionAdded: 2.0.0
        content: |-
          All routes have an identifier:
          - If it's a [named route](#api-mockingmock_options), the identifier is the route's `name`
          - If the route is unnamed, the identifier is the value of the `matcher` argument that was passed in to `.mock()`

          All calls that were handled by the route with the given identifier will be retrieved
      - name: matcher
        versionAdded: 7.0.0
        types:
          - String
          - RegExp
          - function
        content: |-
          Any matcher compatible with the [mocking api](#api-mockingmock_matcher) can be passed in to filter the calls arbitrarily. The matcher will be executed using exactly the same rules as the mocking api
  - name: options
    versionAdded: 7.0.0
    types:
      - Object
      - String
    content: |-
      Either an object compatible with the [mocking api](#api-mockingmock_options) or a string specifying a http method to filter by. This will be used to filter the list of calls further
content_markdown: |-

  The filtering API is powerful, but potentially confusing. If in doubt, [add a `name` to your route](#api-mockingmock_options), and pass that name in to retrieve exactly the calls you want.

  #### A note on Regular Expression and Function matchers
  To retrieve calls handled by a route with a `RegExp` or `function` matcher, use a reference to the exact `RegExp`|`function` you used in your mock, e.g.

  ```javascript
  const matcherRX = /user\/biff/
  fm.mock(matcherRX, 200)
  ...
  fm.called(matcherRX)
  ```

  not

  ```javascript
  fm.mock(/user\/biff/, 200)
  ...
  fm.called(/user\/biff/)
  ```

  The second example _will_ retrieve the expected calls in simple test scenarios because if no routes match using the identifier the `RegExp` will be executed as a `RegExp` matcher. But in more complex scenarios where e.g. there are several routes handling similar paths, it might retrieve calls that were actually handled by different, similar route e.g.

  ```javascript
  const matcherRX = /user\/biff/
  fm
    .mock('end:user/biff')
    .mock(matcherRX, 200)
  ...
  // this will retrieve calls handled by either route
  fm.called(/user\/biff/)
  // this will retrieve only calls handled by the second route
  fm.called(matcherRX)
  ```
---
