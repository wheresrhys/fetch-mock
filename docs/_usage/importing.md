---
title: Importing the correct version
position: 4
parentItem: installation
content_markdown: |-

  The JS ecosystem is in a transitional period between module systems, and there are also a number of different build tools available, all with their own idosyncratic opinions about how JS should be compiled. The following detail may help debug any problems, and a few known workarounds are listed below.

  #### Built files
  In general `server` refers to the version of the source code designed for running in nodejs, whereas `client` refers to the version designed to run in the browser. As well as this distinction, fetch-mock builds several versions of itself:
  - `/cjs` directory - this contains a copy of the source files (which are currently written as commonjs modules). They are copied here in order to prevent direct requires from `/src`, which could make migrating the src to ES modules troublesome. `client.js` and `server.js` are the entry points. The directory also contains a `package.json` file specifying that the directory contains commonjs modules.
  - `/esm` directory - This contains builds of fetch-mock, exported as ES modules. `client.js` and `server.js` are the entry points. The bundling tool used is [rollup](https://rollupjs.org).
  - `/es5` directory - This contains builds of fetch-mock which do not use any JS syntax not included in the [ES5 standard](https://es5.github.io/), i.e. excludes recent additions to the language. It contains 4 entry points:
    - `client.js` and `server.js`, both of which are commonjs modules
    - `client-legacy.js`, which is the same as `client.js`, but includes some babel polyfill bootstrapping to ease running it in older environments
    - `client-bundle.js`, `client-legacy-bundle.js`, which are standalone [UMD](https://github.com/umdjs/umd) bundles of the es5 client code that can be included in the browser using an ordinary script tag. The bundling tool used is [rollup](https://rollupjs.org).

  #### Importing the right file
  The package.json file references a selection of the above built files:
  ```json
  {
    "main": "./cjs/server.js",
    "browser": "./esm/client.js",
    "module": "./esm/server.js",
  }
  ```
  These are intended to target the most common use cases at the moment:
  - nodejs using commonjs
  - nodejs using ES modules
  - bundling tools such as webpack

  In most cases, your environment & tooling will use the config in package.json to import the correct file when you `import` or `require` `fetch-mock` by its name only.

  However, `import`/`require` will sometimes get it wrong. Below are a few scenarios where you may need to directly reference a different entry point.

  - If your client-side code or tests do not use a loader that respects the `browser` field of `package.json` use `require('fetch-mock/es5/client')` or `import fetchMock from 'fetch-mock/esm/client'`.
  - When not using any bundler in the browser, use one of the following as the src of a script tag: `node_modules/fetch-mock/es5/client-bundle.js`, `node_modules/fetch-mock/es5/client-legacy-bundle.js`. This loads fetch-mock into the `fetchMock` global variable.
  - For Node.js 6 or lower use `require('fetch-mock/es5/server')`
---
