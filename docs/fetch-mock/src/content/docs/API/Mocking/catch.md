---
title: '.catch(response)'
sidebar:
  label: .catch()
  order: 3
---

Specifies how to respond to calls to `fetch` that don't match any mocks.

It accepts any valid [fetch-mock response](#api-mockingmock_response), and can also take an arbitrary function to completely customise behaviour. If no argument is passed, then every unmatched call will receive a `200` response
