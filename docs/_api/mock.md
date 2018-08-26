---
title: ".mock()"
position: 1.1
description: "Replaces `fetch` with a stub which records its calls and returns a `Response` instance."
parameters:
  - name: matcher
    content: "`String`|`Regex`|`Function`: Rule for matching calls to `fetch`"
  - name: response
    content: "`String`|`Object`|`Function`|`Promise`: Response to send matched calls"
  - name: options
    content: "`Object`: More options configuring [mainly] matching behaviour"
content_markdown: |-

  Alternatively a single parameters, `options`, and `Object` with `matcher`, `response` and other options defined on it, can be passed
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
      {
        "id": 3,
        "title": "The Book Thief",
        "score": 4.3,
        "dateAdded": "5/1/2015"
      }
    title: Response
    language: json
  - code_block: |-
      {
        "error": true,
        "message": "Invalid score"
      }
    title: Error
    language: json
---


