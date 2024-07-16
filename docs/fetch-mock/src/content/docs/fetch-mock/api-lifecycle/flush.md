---
title: .flush(waitForBody)
sidebar:
  # Set a custom label for the link
  label: Custom sidebar label
  # Set a custom order for the link (lower numbers are displayed higher up)
  order: 2
  # Add a badge to the link
  badge:
    text: New
    variant: tip
---
Returns a `Promise` that resolves once all fetches handled by fetch-mock have resolved

Useful for testing code that uses `fetch` but doesn't return a promise.

If `waitForBody` is `true`, the promise will wait for all body parsing methods (`res.json()`, `res.text()`, etc.) to resolve too.
