---
title: Versions
sidebar:
  order: 2
---

### Version 10

This has 2 major differences from previous versions

1. It is written using ES modules
2. It uses native fetch in node.js

If you experience any compatibility issues upgrading from version 9, please either

- try the approaches iom the troubleshooting section of these docs
- downgrade to v9 again

I intend to keep version 10 and above r4easonably clean, with as few workarounds for different toolchains as possible. Hopefully, as other toolchains gradually migrate to ESM and native fetch then fetch-mock will eventually be compatible with their latest versions.

### Version 9 and below

v7, v8 & v9 are practically identical, only differing in their treatment of a few edge cases, or in compatibility with other libraries and environments. For clarity, each section of the documentation tells you which version a feature was added with a <small class="version-added">version</small> label.

For previous versions follow the documentation below:

- [v7 upgrade guide](https://github.com/wheresrhys/fetch-mock/blob/master/docs/v6-v7-upgrade-guide.md)
- [v6 docs](https://github.com/wheresrhys/fetch-mock/tree/4231044aa94e234b53e296181ca5b6b4cecb6e3f/docs)
- [v5 docs](https://github.com/wheresrhys/fetch-mock/tree/b8270640d5711feffb01d1bf85bb7da95179c4de/docs)
