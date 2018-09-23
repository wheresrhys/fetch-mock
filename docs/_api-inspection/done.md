---
title: .done(filter)
navTitle: .done()
position: 6
description: |-
  Returns a Boolean indicating whether `fetch` was called the expected number of times (or has been called at least once if `repeat` is undefined for the route)
parameters:
  - name: matcherOrName
    content: Rule for matching calls to `fetch`.
    options:
      - types:
        - undefined
        - true
        content: |-
          Runs over all calls matched by `fetch`
      - name: routeIdentifier
        types:
          - String|RegExp|function
        content: |-
          All routes have an identifier:
          - If it's a named route, the identifier is the route's name
          - If the route is unnamed, the identifier is the `matcher` passed in to `.mock()`

          All calls that were handled by the route with the given identifier will be retrieved
content_markdown: |-
  If several routes have the same matcher/url, but use [mocking options](#apimockingmock_options), the recommended way to handle this is to name each route and filter using those names
  {: .info}
---
