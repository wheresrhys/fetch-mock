---
title: Installation
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

Install fetch-mock using

```bash
npm install --save-dev fetch-mock
```

fetch-mock supports both [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [commonjs](https://requirejs.org/docs/commonjs.html). The following should work in most environments. Check the [importing the correct version](#usageimporting) section of the docs if you experience problems.

## ES modules
```js
import fetchMock from 'fetch-mock';
```

## Commonjs
```js
const fetchMock = require('fetch-mock');
```
