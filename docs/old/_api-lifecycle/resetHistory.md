---
title: .resetHistory()
position: 4
versionAdded: 7.0.0
description: |-
  Clears all data recorded for `fetch`'s calls. It _will not_ restore fetch to its default implementation
content_markdown: |-
  `resetHistory()` is bound to fetchMock, and can be used directly as a callback e.g. `afterEach(fetchMock.resetHistory)` will work just fine. There is no need for `afterEach(() => fetchMock.resetHistory())`
---
