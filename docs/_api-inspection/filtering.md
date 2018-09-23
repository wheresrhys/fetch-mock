---
title: "Filtering basics"
position: 0
description: |-
  Most inspection methods take two arguments — `filter` and `options` — which allow groups of fetch calls to be extracted and inspected.
parameters:
  - name: filter
    content: |-
      Allows filtering of calls to fetch based on various criteria
    options:
      - types:
        - undefined
        content: |-
          Retrieves all calls made to `fetch`, whether a specific route matched them or not
      - types:
        - true
        content: |-
          Retrieves all calls matched by `fetch`. `fetchMock.MATCHED` is an alias for `true` and may be used to make tests more readable
      - types:
        - false
        content: |-
          Retrieves all calls not matched by `fetch` (i.e. those handled by `catch()` or `spy()`. `fetchMock.UNMATCHED` is an alias for `false` and may be used to make tests more readable
      - name: routeIdentifier
        types:
          - String|RegExp|function
        content: |-
          All routes have an identifier:
          - If it's a named route, the identifier is the route's name
          - If the route is unnamed, the identifier is the `matcher` passed in to `.mock()`

          All calls that were handled by the route with the given identifier will be retrieved
      - name: matcher
        types:
          - String|RegExp|function
        content: |-
          Any matcher compatible with the [mocking api](#api-mockingmock_matcher)] can be passed in to filter the calls arbitrarily
  - name: options
    types:
      - Object
      - String
    content: |-
      Either an object compatible with the [mocking api](#api-mockingmock_options) or a string specifying a http `method` to filter by. This will be used to filter the list of calls further
content_markdown: |-

  If in doubt, [add a name to your route](#api-mockingmock_options), and pass in that name to retrieve exactly the calls you want.
  {:.info}

  Note that when matching calls handled by a route with a `RegExp` or `function` matcher, use the exact `RegExp`|`function` you used in your mock, e.g.
  {:.warning}

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

  The second example _will_ retrieve the expected calls in simple test scenarios because if no routes match using the `identifier` the `RegExp` will be executed as a `RegExp` matcher. But in more complex scenarios where e.g. there are several routes handling similar paths, it might retrieve calls that were actually handled by different, similar route e.g.

  ```javascript
  const matcherRX = /user\/biff/
  fm
    .mock('end:user/biff')
    .mock(matcherRX, 200)
  ...
  // this will retrieve calls handled by either route
  fm.called(/user\/biff/)
  // this will retrieve only calls handeld by the second route
  fm.called(/user\/biff/)
  ```
---
