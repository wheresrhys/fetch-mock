---
title: Publishing packages as ESM and commonjs
slug: esm-and-commonjs
authors:
  - name: Rhys Evans
    title: fetch-mock maintainer
    url: https://www.wheresrhys.co.uk
hide_table_of_contents: false
---

Publishing a package that is compatible with all the following is not straightforward

1. A commonjs javascript project
2. A ESM javascript project
3. A commonjs typescript project
4. A ESM typescript project

I previously thought I'd cracked it by adding `"type": "module"` to the package.json but including a `{"type": "commonjs"}` package.json to the subdirectory that contained my commonjs built files.

However [this issue](https://github.com/wheresrhys/fetch-mock/issues/726) indicated that use case 3 was not supported. [This article](https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html) suggested that the best solution was to build a .mjs file for ESM, a .cjs file for CJS, and leave the top level package.json without a `"type": "module"` declaration.

I'm not a big fan of this as it makes it harder to fork the library or test a branch because every way of requiring it entails a build step, which is typically not carried out when requireing directly from a branch.

So after mulling things over I came up with a simple solution: remove the `"type": "module"` declaration from the top level package.json and instead create a `{"type": "module"}` package.json in my srcdirectory.

I thought I'd share as it's not obvious this would work - I did a fair bit of manual testing to prove it - but it's an elegant and low-build approach I've not seen publicised elsewhere.
