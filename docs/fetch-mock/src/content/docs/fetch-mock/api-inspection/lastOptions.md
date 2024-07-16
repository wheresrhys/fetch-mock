---
title: .lastOptions(filter, options)
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
Returns the options for the last call to `fetch` matching the given `filter` and `options`. If `fetch` was last called using a `Request` instance, a set of `options` inferred from the `Request` will be returned
