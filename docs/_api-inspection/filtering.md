---
title: "Filtering basics"
position: 0
description: |-
  Most inspection methods take two arguments — `filter` and `options` — which allow groups of fetch calls to be extracted and inspected.
parameters:
  - name: filter
    types:
      - String
      - RegExp
      - Function
    content: |-
      Enables filtering fetch calls for the most commonly use cases. The behaviour can be counterintuitive. The following rules, applied in the order they are described, are used to try to retrieve calls. If any rule retrieves no calls the next rule will be tried.
    options:
      - name: matcher
        content: |-
          If `options` is defined (it can even be an empty object), `filter` will be executed using the same execution plan as [matchers](#api-mockingmock_matcher). Any calls matched by it will be returned.
        types:
          - String
          - RegExp
          - Function
      - types:
        - undefined
        content: |-
          Retrieves all calls made to `fetch`, whether fetch-mock matched them or not
      - types:
        - true
        content: |-
          Retrieves all calls matched by `fetch`. `fetchMock.MATCHED` is an alias for `true` and may be used to make tests more readable
      - types:
        - false
        content: |-
          Retrieves all calls not matched by `fetch` (i.e. those handled by `catch()` or `spy()`. `fetchMock.UNMATCHED` is an alias for `false` and may be used to make tests more readable
      - name: route
        types:
          - String
        content: Retrieves calls handled by a named route (see [mocking options](#api-mockingmock_options). Failing that, a route whose matcher, when coerced to a string, is equal to the string provided
      - name: asdkash d
        content: Do I want to fallback to a matcher again?? Seems confusing as hell

  - name: options
    types:
      - Object
      - String
    content: |-
      Either an object compatible with the [mocking api](#api-mockingmock_options) or a string specifying a http `method` to filter by
---
