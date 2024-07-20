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

> Note that if using a Full url matcher or `end:`, fetch-mock ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`

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

```
{
	express: "/:section/user/:user",
	params: {"section": "feed", "user": "geoff"}
}
```

## Other matching criteria

### method

`{String}`

Match only requests using this http method. Not case-sensitive, e.g. `{method: "get"}`, `{method: "POST"}`

### headers

`{Object|Headers}`

Match only requests that have these headers set, e.g. `{headers: {"Accepts": "text/html"}}`

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

Note that if matching on body _and_ using `Request` instances in your source code, this forces fetch-mock into an asynchronous flow _before_ it is able to route requests effectively. This means no [inspection methods](#api-inspectionfundamentals) can be used synchronously. You must first either await the fetches to resolve, or `await fetchMock.callHistory.flush()`. The popular library [Ky](https://github.com/sindresorhus/ky) uses `Request` instances internally, and so also triggers this mode.

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

This option can also be [set in the global configuration](/fetch-mock/docs/@fetch-mock/core/configuration)

## Function matchers

`{Function(url, option, [Request]): {Boolean}}`

For use cases not covered by all the built in matchers, a custom function can be used. It should return `true` to indicate a route should respond to a request. It will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` available as a third argument.

As well as being passed as a standalone argument, it can also be added to the matcher object as the property `{matcherFunction: ...}` when combining with other matchers or options.

### Examples

- `(url, {headers}) => !!headers.Authorization`
- `(_, _, request) => !!request.headers.get('Authorization')`
