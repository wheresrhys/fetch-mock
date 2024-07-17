---
title: 'matcher'
sidebar:
  order: 1
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 2
---

Criteria for deciding which requests to mock.

Note that if you use matchers that target anything other than the url string, you may also need to add a `name` to your matcher object so that a) you can add multiple mocks on the same url that differ only in other properties (e.g. query strings or headers) b) if you [inspect](#api-inspectionfundamentals) the result of the fetch calls, retrieving the correct results will be easier.

## Argument values

> Note that if using `end:` or an exact url matcher, fetch-mock ([for good reason](https://url.spec.whatwg.org/#url-equivalence)) is unable to distinguish whether URLs without a path end in a trailing slash or not i.e. `http://thing` is treated the same as `http://thing/`

### \*

`{String}`

Matches any url

### url

`{String|URL}`
Match an exact url. Can be defined using a string or a `URL` instance, e.g. `"http://www.site.com/page.html"`

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

### express:...

`{String}`
Match a url that satisfies an [express style path](https://www.npmjs.com/package/path-to-regexp), e.g. `"express:/user/:user"`

See also the `params` option before for matching on the values of express parameters.

### RegExp

`{RegExp}`
Match a url that satisfies a regular expression, e.g. `/(article|post)\/\d+/`

### Function

`{Function}`
Match if a function returns something truthy. The function will be passed the `url` and `options` `fetch` was called with. If `fetch` was called with a `Request` instance, it will be passed `url` and `options` inferred from the `Request` instance, with the original `Request` will be passed as a third argument.

This can also be set as a `functionMatcher` in the [options parameter](#api-mockingmock_options), and in this way powerful arbitrary matching criteria can be combined with the ease of the declarative matching rules above.

#### Examples

- `(url, {headers}) => !!headers.Authorization`
- `(_, _, request) => !!request.headers.get('Authorization')`

### Options Object

`{Object}`

The url and function matchers described above can be combined with other criteria for matching a request by passing an options object which may have one or more of the properties described in the documentation for the `options` parameter.

In particular, **headers\*, **query string parameters**, **request bodies** and **express parameter values\*\* can all be used as matching criteria.

#### Examples

- `{url: 'end:/user/profile', headers: {Authorization: 'Basic 123'}}``
- `{query: {search: 'abc'}, method: 'POST'}`
