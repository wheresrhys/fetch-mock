---
title: .done(filter, options)
navTitle: .done()
position: 6
description: |-
  Returns a Boolean indicating whether `fetch` was called the expected number of times (or has been called at least once if `repeat` is undefined for the route)
parameters:
  - name: matcherOrName
    types:
      - String
      - Regex
      - Function
    content: Rule for matching calls to `fetch`
content_markdown: |-
	TODO - describe how it's best to name routes
  Unlike the other methods for inspecting calls, unmatched calls are irrelevant. If no `filter` is passed, `done()` returns `true` if every route has been called the number of expected times.
  {: .warning}
---
