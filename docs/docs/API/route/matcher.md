---
sidebar_position: 1
---

# matcher

Determines whether a route should be used to generate a response for a request.

URL matchers and function matchers can be passed in as standalone values. They can also be combined with other matchers by passing in an object containing one or more matchers. e.g.

```js
{
	url: "begin: https://my.site",
	method: 'post'
}
```

## URL matchers

All of the following can be passed in directly as the `matcher` argument or as the property `{url: ...}` when combining with other matchers or options.

#### URL matching oddities

`fetch` and other standards have strong opinions about how to interpret URLs. `fetch-mock` attempts to respect these, which can lead to unexpected behaviour. The notes below apply to all types of url matcher.

1. Trailing slashes are ignored i.e. `http://thing` is treated the same as `http://thing/` ([read the spec](https://url.spec.whatwg.org/#url-equivalence))
2. When using dot segments in urls `fetch-mock` will match both the full path containing dot segments, and the path ot resolves to e.g. `/path/../other-path` will match `/path/../other-path` and `/other-path` ([read the spec](https://github.com/wheresrhys/fetch-mock/issues/763#:~:text=resolved%20as%20per-,the%20spec,-before%20attempting%20to))
3. `fetch` will convert any protocol-relative urls to ones using the protocol of the current page e.g. if the browser is at `**http:**//a.com` and your application calls `fetch('//some.url')`, a request will be made to `**http:**//some.url`. However, to discourage writing tests that pass in one environment but not another, `fetch-mock` **will only** match requests where the protocol (or lack of) is exactly the same as the route. e.g. `begin://a.com` will match `//a.com/path` but not `http://a.com/path`
4. Fetches of relative urls e.g. `fetch('image.jg')` or `fetch('/path')` are technically not supported in node.js at all. However, `fetch-mock` will handle them if either
   a) The global `fetch-mock` option `fetchMock.config.allowRelativeUrls = true` is set
   b) [jsdom](https://www.npmjs.com/package/jsdom) or similar is used to set `globalThis.location` to an instance of the DOM class `Location`. If this approach is taken then - similar to the treatment of dot segments described above - the fully resolved url and relative urls can be matched interchangably e.g. `fetch('image.jpg')` on the page `http://a.com/path` will be matched by `image.jpg` and by `http://a.com/path/image.jpg`

### Full url

`{String|URL}`

Match an exact url. Can be defined using a string or a `URL` instance, e.g. `"http://www.site.com/page.html"`

The value `*` can be used to match any url

### begin:...

`{String}`

Match a url beginning with a string, e.g. `"begin:http://www.site.com"`

### end:...

`{String}`

Match a url ending with a string, e.g. `"end:.jpg"`

### path:...

`{String}`

Match a url which has a given path, e.g. `"path:/posts/2018/7/3"`

### glob:...

`{String}`

Match a url using a glob pattern, e.g. `"glob:http://*.*"`

### RegExp

`{RegExp}`

Matches a url that satisfies a regular expression, e.g. `/(article|post)\/\d+/`

### express:...

`{String}`

Match a url that satisfies an [express style path](https://www.npmjs.com/package/path-to-regexp), e.g. `"express:/user/:user"`

#### Matching express param values

`{Object}`

When the `express:` keyword is used in a string matcher, it can be combined with the `{params: ...}` matcher to match only requests whose express parameters evaluate to certain values. e.g.

```js
{
	url: "express:/:section/user/:user",
	params: {"section": "feed", "user": "geoff"}
}
```

The values of express parameters are made available in the `expressParams` property when

- [Inspecting call history](/fetch-mock/docs/API/CallHistory#calllog-schema)
- [Using a function to construct a response](/fetch-mock/docs/API/route/response#function)

### Multiple url matchers

All of the above (with the exception of the full url matcher) can be combined in an object in order to match multiple patterns at once e.g.

```js
{
	url: {
		begin: 'https',
		path: '/could/be/any/host'
	}
}
```

## Other matching criteria

### method

`{String}`

Match only requests using this http method. Not case-sensitive, e.g. `{method: "get"}`, `{method: "POST"}`

### headers

`{Object|Headers}`

Match only requests that have these headers set, e.g. `{headers: {"Accepts": "text/html"}}`

#### missingHeaders

`{String[]}`

Matches any requests where **all** of a list of header names are missing on a request e.g. `{missingHeaders: ["Authorization"]}`.

### query

`{Object}`

Match only requests that have these query parameters set (in any order). Query parameters are matched by using Node.js [querystring](https://nodejs.org/api/querystring.html) module. In summary the bahaviour is as follows

- strings, numbers and booleans are coerced to strings
- arrays of values are coerced to repetitions of the key
- all other values, including `undefined`, are coerced to an empty string
  The request will be matched whichever order keys appear in the query string.
  Any query parameters sent in the request which are not included in the keys of the object provided will be ignored.

#### Examples

- `{{query: "q": "cute+kittenz"}}` `?q=cute kittenz` or `?q=cute+kittenz` or `?q=cute+kittenz&mode=big`
- `{{query: "tags": ["cute", "kittenz"]}}` `?tags=cute&tags=kittenz`
- `{{query: "q": undefined, inform: true}}` `?q=&inform=true`

### body

`{Object}`

Match only requests that send a JSON body with the exact structure and properties as the one provided here.

Note that if matching on body _and_ using `Request` instances in your source code, this forces fetch-mock into an asynchronous flow _before_ it is able to route requests effectively. This means no [call history methods](/fetch-mock/docs/API/CallHistory) can be used synchronously. You must first either await the fetches to resolve, or `await fetchMock.callHistory.flush()`. The popular library [Ky](https://github.com/sindresorhus/ky) uses `Request` instances internally, and so also triggers this mode.

e.g.`{body: { "key1": "value1", "key2": "value2" }}`

#### matchPartialBody

`{Boolean}`

When matching a body, this option ignores any properties not mentioned in the matcher e.g. the following will ignore any properties of body that are not `"key1"`, and will therefore match the body `{ "key1": "value1", "key2": "value2" }`.

```
{
	body: { "key1": "value1"},
	matchPartialBody: true
}
```

This option can also be [set in the global configuration](/fetch-mock/docs/Usage/configuration)

## Function matchers

`{Function(url, option, [Request]): {Boolean}}`

For use cases not covered by all the built in matchers, a custom function can be used. It should return `true` to indicate a route should respond to a request. It will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` available as a third argument.

As well as being passed as a standalone argument, it can also be added to the matcher object as the property `{matcherFunction: ...}` when combining with other matchers or options.

### Examples

- `(url, {headers}) => !!headers.Authorization`
- `(_, _, request) => !!request.headers.get('Authorization')`
