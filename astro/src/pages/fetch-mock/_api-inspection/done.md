---
title: .done(filter)
navTitle: .done()
position: 6
versionAdded: 5.3.0
description: |-
  Returns a Boolean indicating whether `fetch` was called the expected number of times (or has been called at least once if `repeat` is undefined for the route). It does not take into account whether the `fetches` completed successfully.
parameters:
  - name: matcherOrName
    content: Rule for matching calls to `fetch`.
    options:
      - types:
          - undefined
          - true
        content: |-
          Returns true if all routes have been called the expected number of times
      - name: routeIdentifier
        types:
          - String|RegExp|function
        content: |-
          All routes have an identifier:
          - If it's a named route, the identifier is the route's name
          - If the route is unnamed, the identifier is the `matcher` passed in to `.mock()`

          Returns true if the routes specified by the identifier has been called the expected number of times
content_markdown: |-
  If several routes have the same matcher/url, but use [mocking options](#apimockingmock_options), the recommended way to handle this is to [name each route](#api-mockingmock_options) and filter using those names
---
