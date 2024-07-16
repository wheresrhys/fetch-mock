---
title: Debugging
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
The first  step when debugging tests should be to run with the environment variable `DEBUG=fetch-mock*`. This will output additional logs for debugging purposes.
