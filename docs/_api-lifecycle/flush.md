---
title: .flush(waitForBody)
navTitle: '.flush()'
position: 2
versionAdded: 5.11.0
description: |-
  Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved
content_markdown: |-
  Useful for testing code that uses `fetch` but doesn't return a promise.

  If `waitForBody` is `true`, the promise will wait for all body parsing methods (`res.json()`, `res.text()`, etc.) to resolve too.
---
