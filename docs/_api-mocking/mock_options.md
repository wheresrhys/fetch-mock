---
title: 'options'
position: 1.3
description: |-
  An object containing further options for configuring mocking behaviour.

  In addition to all the options listed below, all the options available for use when using an options object as the first argument to `.mock()` can also be passed in on the third argument. These include:

  - `repeat` - defining how many times a mock should match calls
  - `header`, `query`, `params`, `method`, `body` - matching calls on criteria other than the url
types:
  - Object
type: parameter
parentMethod: mock
parentMethodGroup: mocking
parametersBlockTitle: Response options
parameters:
  - name: delay
    versionAdded: 7.7.0
    types:
      - Integer
    content: |-
      Delays responding for the number of milliseconds specified.
  - name: sendAsJson
    default: true
    types:
      - Boolean
    content: See [global configuration](#usageconfiguration)
  - name: includeContentLength
    default: true
    types:
      - Boolean
    content: See [global configuration](#usageconfiguration)
---
