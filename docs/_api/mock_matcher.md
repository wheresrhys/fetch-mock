---
title: ".mock() - #matcher"
position: 1.1
description: "String|Regex|Function: Rule for matching calls to `fetch`"
parametersBlockTitle: Variants
parameters:
  - name: "*"
    content: Matches any url
  - name: "url, e.g. 'http://www.site.com/page.html'"
    content: Match an exact url
content_markdown: |-
  asdasd



right_code_blocks:
  - title: Example
    language: javascript
    code_block: |-
      fetchMock
        .mock('begin:http://it.at.here/api', 200, {
          headers: {
            authorization: 'Basic dummy-token'
          }
        })
        .mock('begin:http://it.at.here/api', 403)

      callApi('/endpoint', 'dummy-token')
        .then(res => {
          expect(res.status).to.equal(200)
        })

left_code_blocks:
  - code_block: |-
      fetchMock
        .mock('http://it.at.here/route', 200)
        .mock('begin:http://it', 200)
        .mock('end:here/route', 200)
        .mock('path:/route', 200)
        .mock('*', 200)
    title: Strings
    language: javascript
  - code_block: |-
      fetchMock
        .mock(/.*\.here.*/, 200)
        .mock((url, opts) => opts.method === 'patch', 200)
        .mock('express:/:type/:id', 200, {
          params: {
            type: 'shoe'
          }
        })
    title: Complex Matchers
    language: javascript
  - code_block: |-
      fetchMock
        .mock('*', 'ok')
        .mock('*', 404)
        .mock('*', {results: []})
        .mock('*', {throw: new Error('Bad kitty')))
        .mock('*', new Promise(res => setTimeout(res, 1000, 404)))
    title: Responses
    language: javascript
---


