---
title: ".mock()"
position: 1.1
description: "Replaces `fetch` with a stub which records its calls and returns a `Response` instance."
parameters:
  - name: matcher
    content: "String|Regex|Function: Rule for matching calls to `fetch`"
  - name: response
    content: "String|Object|Function|Promise: Response to send matched calls"
  - name: options
    content: "Object: More options configuring [mainly] matching behaviour"
content_markdown: |-

  Alternatively a single parameter, `options`, an `Object` with `matcher`, `response` and other options defined, can be passed
  {: .info}

left_code_blocks:
  - code_block: |-
      $.post("http://api.myapp.com/books/", {
        "token": "YOUR_APP_KEY",
        "title": "The Book Thief",
        "score": 4.3
      }, function(data) {
        alert(data);
      });
    title: jQuery
    language: javascript
right_code_blocks:
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


