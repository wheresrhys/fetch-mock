---
title: Overview
sidebar_position: 0
---

fetch-mock is the most comprehensive library for mocking the fetch API.

It allows mocking http requests made using [fetch](https://fetch.spec.whatwg.org/) or a library imitating its api, such as [node-fetch](https://www.npmjs.com/package/node-fetch).

It supports most JavaScript environments, including browsers, Node.js, web workers and service workers.

As well as shorthand methods for the simplest use cases, it offers a flexible API for customising all aspects of mocking behaviour.

> **For documentation for fetch-mock v11 and below visit the [Legacy API docs](/fetch-mock/docs/legacy-api)**

## Examples

```js
import fetchMock from 'fetch-mock';
fetchMock.mockGlobal().route('http://example.com', 200);
const res = await fetch('http://example.com');
assert(res.ok);
```

```js
import fetchMock from 'fetch-mock';

fetchMock
  .mockGlobal()
  .route({
    express: '/api/users/:user'
    expressParams: {user: 'kenneth'}
  }, {
    userData: {
      email: 'kenneth@example.com'
    }
  }, 'userDataFetch');

const res = await fetch('http://example.com/api/users/kenneth');
assert(fetchMock.called('userDataFetch'))
const data = await res.json();
assertEqual(data.userData.email, 'kenneth@example.com')
```
