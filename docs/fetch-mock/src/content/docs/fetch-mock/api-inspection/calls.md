---
title: .calls(filter, options)
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
Returns an array of all calls to fetch matching the given `filter` and `options`. Each call is returned as a `[url, options]` array. If `fetch` was called using a `Request` instance, the `url` and `options` will be inferred from it, and the original `Request` will be available as a `request` property on this array.
