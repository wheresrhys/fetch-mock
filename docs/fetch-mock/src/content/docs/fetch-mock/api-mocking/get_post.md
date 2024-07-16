---
title: '.get(), .post(), .put(), .delete(), .head(), .patch()'
sidebar:
  # Set a custom label for the link
  label: Custom sidebar label
  # Set a custom order for the link (lower numbers are displayed higher up)
  order: 2
  # Add a badge to the link
  badge:
    text: New
    variant: tip
---
Shorthands for `mock()` that create routes that only respond to requests using a particular http method.

If you use some other method a lot you can easily define your own shorthands e.g.

```javascript
fetchMock.purge = function (matcher, response, options) {
    return this.mock(
      matcher,
      response,
      Object.assign({}, options, {method: 'PURGE'})
    );
}
```
