---
sidebar_position: 3
---

# .flush(waitForBody)

Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved

Useful for testing code that uses `fetch` but doesn't return a promise.

If `waitForBody` is `true`, the promise will wait for all body parsing methods (`res.json()`, `res.text()`, etc.) to resolve too.
