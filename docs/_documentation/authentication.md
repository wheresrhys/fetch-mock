---
title: Authentication
position: 2
parameters:
  - name:
    content:
content_markdown: |-
  You need to be authenticated for all API requests. You can generate an API key in your developer dashboard.

  Add the API key to all requests as a GET parameter.

  Nothing will work unless you include this API key
  {: .error}
left_code_blocks:
  - code_block:
    title:
    language:
right_code_blocks:
  - code_block: |2-
       $.get("http://api.myapp.com/books/", { "token": "YOUR_APP_KEY"}, function(data) {
         alert(data);
       });
    title: JQuery
    language: javascript
  - code_block: |2-
       curl http://api.myapp.com/books?token=YOUR_APP_KEY
    title: Curl
    language: bash
---