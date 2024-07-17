---
title: '.catch(response)'
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
Specifies how to respond to calls to `fetch` that don't match any mocks.

It accepts any valid [fetch-mock response](#api-mockingmock_response), and can also take an arbitrary function to completely customise behaviour. If no argument is passed, then every unmatched call will receive a `200` response
