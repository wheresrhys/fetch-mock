---
title: .lastResponse(filter, options)
navTitle: .lastResponse()
position: 5.5
versionAdded: 9.10.0
description: |-
  Returns the `Response` for the last call to `fetch` matching the given `filter` and `options`. 

  If `.lastResponse()` is called before fetch has been resolved then it will return `undefined`
  {: .warning} 
  
  To obtain json/text responses await the `.json()/.text()` methods of the response
  {: .info} 
---

