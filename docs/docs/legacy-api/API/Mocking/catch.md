---
sidebar_position: 3
---

# .catch(response)

Specifies how to respond to calls to `fetch` that don't match any mocks.

It accepts any valid [fetch-mock response](/fetch-mock/docs/legacy-api/API/Mocking/Parameters/response), and can also take an arbitrary function to completely customise behaviour. If no argument is passed, then every unmatched call will receive a `200` response
