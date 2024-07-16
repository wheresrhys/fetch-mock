---
title: More shorthands
navTitle: ... more shorthands
position: 5
description: |-
  The atomic shorthand methods - `.once()`, `any()`, and `.get()`, `.post()`, etc. are combined into a variety of shorthand methods that blend their behaviours.
parametersBlockTitle: Methods
parameters:
  - name: Any once
    versionAdded: 9.2.0
    content: |-
      Create a route that responds to any single request: `.anyOnce(response, options)`

  - name: Method once
    versionAdded: 5.3.0
    content: |-
      Create a route that only responds to a single request using a particular http method: `.getOnce()`, `.postOnce()`, `.putOnce()`, `.deleteOnce()`, `.headOnce()`, `.patchOnce()`

  - name: Method any

    versionAdded: 9.2.0
    content: |-
      Create a route that responds to any requests using a particular http method: `.getAny()`, `.postAny()`, `.putAny()`, `.deleteAny()`, `.headAny()`, `.patchAny()`

  - name: Method any once
    versionAdded: 9.2.0
    content: |-
      Create a route that responds to any single request using a particular http method: `.getAnyOnce()`, `.postAnyOnce()`, `.putAnyOnce()`, `.deleteAnyOnce()`, `.headAnyOnce()`, `.patchAnyOnce()`
---
