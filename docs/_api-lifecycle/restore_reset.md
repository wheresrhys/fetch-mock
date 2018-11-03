---
title: .restore(), .reset()
navTitle: .restore(), .reset()
position: 3
description: |-
  Restores `fetch()` to its unstubbed state and clears all data recorded for its calls. `reset()` is an alias for `restore()`
---

#### ``

Chainable method that .

#### `resetHistory()`

Chainable method that clears all data recorded for `fetch()`'s calls. _It will not restore fetch to its default implementation_

_Note that `restore()`, `reset()` and `resetHistory()` are all bound to fetchMock, and can be used directly as callbacks e.g. `afterEach(fetchMock.reset)` will work just fine. There is no need for `afterEach(function () {fetchMock.reset()})`_

#### `flush()`

