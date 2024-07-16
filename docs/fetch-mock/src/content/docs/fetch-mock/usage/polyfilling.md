---
title: Polyfilling fetch
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
Many older browsers require polyfilling the `fetch` global. The following approaches can be used:

- Add the following [polyfill.io](https://polyfill.io/v2/docs/) script to your test page <br>`<script src="https://polyfill.io/v2/polyfill?features=fetch"></script>`

- `npm install whatwg-fetch` and load `./node_modules/whatwg-fetch/fetch.js` into the page, either in a script tag or by referencing in your test runner config.
