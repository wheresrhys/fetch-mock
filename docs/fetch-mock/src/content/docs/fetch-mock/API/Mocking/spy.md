---
title: '.spy(matcher)'
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
Records call history while passing each call on to `fetch` to be handled by the network. Optionally pass in a `matcher` to scope this to only matched calls, e.g. to fetch a specific resource from the network.

To use `.spy()` on a sandboxed `fetchMock`, `fetchMock.config.fetch` must be set to the same `fetch` implementation used in your application. [See how to configure this](#usagecustom-classes). By default this will be the locally installed version of `node-fetch`
