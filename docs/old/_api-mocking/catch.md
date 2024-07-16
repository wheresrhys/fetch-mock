---
title: '.catch(response)'
navTitle: .catch()
position: 8
versionAdded: 5.0.0
description: |-
  Specifies how to respond to calls to `fetch` that don't match any mocks.
parentMethodGroup: mocking
content_markdown: |-
  It accepts any valid [fetch-mock response](#api-mockingmock_response), and can also take an arbitrary function to completely customise behaviour. If no argument is passed, then every unmatched call will receive a `200` response
---
