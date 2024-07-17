---
title: .resetBehavior()
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
Removes all mock routes from the instance of `fetch-mock`, and restores `fetch` to its original implementation if mocking globally. Will not clear data recorded for `fetch`'s calls. Optionally pass in a `{sticky: true}` option to remove even sticky routes.
