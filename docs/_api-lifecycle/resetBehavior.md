---
title: .resetBehavior()
position: 5
versionAdded: 7.0.0
description: |-
  Removes all mock routes from the instance of `fetch-mock`, and restores `fetch` to its original implementation if mocking globally. Will not clear data recorded for `fetch`'s calls. Optionally pass in a `{sticky: true}` option to remove even sticky routes.
content_markdown: |-
  `resetBehavior()` is bound to fetchMock, and can be used directly as a callback e.g. `afterEach(fetchMock.resetBehavior)` will work just fine. There is no need for `afterEach(() => fetchMock.resetBehavior())`
---
