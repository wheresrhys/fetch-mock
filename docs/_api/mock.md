---
title: .mock()
position: 1.1
description: Create Book
parameters:
  - name: matcher
    content: `String`|`Regex`|`Function`: Rule for matching calls to `fetch`
  - name: response
    content: `String`|`Object`|`Function`|`Promise`: Response to send matched calls
  - name: options
    content: `Object`: More options configuring [mainly] matching behaviour
content_markdown: |-
  Alternatively a single parameters, `options`, and `Object` with `matcher`, `response` and other options defined on it, can be passed
  {: .info}

  Adds a book to your collection.
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





#### `mock(matcher, response, options)` or `mock(options)`

Replaces `fetch` with a stub which records its calls, grouped by route, and optionally returns a mocked `Response` object or passes the call through to `fetch()`. Calls to `.mock()` can be chained. _Note that once mocked, `fetch` will error on any unmatched calls. Use `.spy()` or `.catch()` to handle unmocked calls more gracefully_

- `matcher`: Condition for selecting which requests to mock. (For matching based on headers, query strings or other `fetch` options see the `options` parameter documented below). Accepts any of the following:
  - `string`: Either
    - an exact url to match e.g. 'http://www.site.com/page.html'
    - `*` to match any url
    - `begin:http://www.site.com/` to match urls beginning with a string
    - `end:.jpg` to match urls ending with a string
    - `path:/posts/2018/7/3` to match urls with a given path
    - `glob:http://*.*` to match glob patterns
    - `express:/user/:user` to match [express style paths](https://www.npmjs.com/package/path-to-regexp)
  - `RegExp`: A regular expression to test the url against
  - `Function(url, opts)`: A function (returning a Boolean) that is passed the url and opts `fetch()` is called with (or, if `fetch()` was called with one, the `Request` instance)

_Note that if using `end:` or an exact url matcher, `fetch-mock` ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`_

- `response`: Configures the http response returned by the mock. Can take any of the following values (or be a `Promise` for any of them, enabling full control when testing race conditions etc.)
  - `Response`: A `Response` instance - will be used unaltered
  - `number`: Creates a response with this status
  - `string`: Creates a 200 response with the string as the response body
  - `configObject` If an object _does not contain_ any properties aside from those listed below it is treated as config to build a `Response`
    - `body`: Set the response body (`string` or `object`)
    - `status`: Set the response status (default `200`)
    - `headers`: Set the response headers. (`object`)
    - `throws`: If this property is present then fetch returns a `Promise` rejected with the value of `throws`
    - `sendAsJson`: This property determines whether or not the request body should be converted to `JSON` before being sent (defaults to `true`).
    - `includeContentLength`: Set this property to true to automatically add the `content-length` header (defaults to `true`).
    - `redirectUrl`: _experimental_ the url the response should be from (to imitate followed redirects - will set `redirected: true` on the response)
  - `object`: All objects that do not meet the criteria above are converted to `JSON` and returned as the body of a 200 response.
  - `Function(url, opts)`: A function that is passed the url and opts `fetch()` is called with and that returns any of the responses listed above (or a `Promise` for any of them)
- `options`: A configuration object with all/additional properties to define a route to mock
  - `name`: A unique string naming the route. Used to subsequently retrieve references to the calls, grouped by name. Defaults to `matcher.toString()`
  - `method`: http method to match
  - `headers`: key/value map of headers to match
  - `query`: key/value map of query strings to match, in any order
  - `params`: when the `express:` keyword is used in a string matcher, a key/value map `params` can be passed here, to match the parameters extracted by express path matching
  - `matcher`: as specified above
  - `response`: as specified above
  - `repeat`: An integer, `n`, limiting the number of times the matcher can be used. If the route has already been called `n` times the route will be ignored and the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)
  - `overwriteRoutes`: If the route you're adding clashes with an existing route, setting `true` here will overwrite the clashing route, `false` will add another route to the stack which will be used as a fallback (useful when using the `repeat` option). Adding a clashing route without specifying this option will throw an error. It can also be set as a global option (see the **Config** section below)
