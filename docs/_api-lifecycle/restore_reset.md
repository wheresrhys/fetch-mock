---
title: .restore(), .reset()
navTitle: .restore(), .reset()
position: 3
versionAdded: 7.0.0
description: |-
  Resets `fetch()` to its unstubbed state and clears all data recorded for its calls. `restore()` is an alias for `reset()`
content_markdown: |-
  Both methods are bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(() => fetchMock.reset())`
---
