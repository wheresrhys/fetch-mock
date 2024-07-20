---
title: A new beginning for fetch-mock
description: What's changing, and why
slug: new-beginning
authors:
  - name: Rhys Evans
    title: fetch-mock maintainer
    url: https://www.wheresrhys.co.uk
hide_table_of_contents: false
---

Long time users of fetch-mock may have noticed two things recently

1. This documentation website has had a makeover
2. I'm actually maintaining it again

These two things are closely related. Allow me to explain

## Why I stopped maintaining fetch-mock

As well as the perennial issue familiar to open source maintainers - working long hours for no pay, and not every user being particularly considerate in their feedback - I was also quite frustrated with the node.js and testing landscape.

ECMAScript modules were slowly landing, and causing a lot of disruption and conflicts with different toolchains. Increasingly bug reports were about these conflicts in the wider ecosystem, rather than my code specifically. Really not a lot of fun to fix. Additionally, choices I'd made in fetch-mock's API design predated the arrival of the testing leviathan that is Jest. In trying to play nicely with Jest I found myself implementing hack after hack, and still being at the mercy of changes to Jest's internals. And don't even get me started on the demands to support typescript.

I wasn't being paid and I increasingly felt like I wasn't maintaining a tool, rather piloting a rickety, outdated craft through choppy waters.

Who needs that in their life?

## Why I'm back

I've been unemployed for the last ~4 months, taking stock of my career and where it might head next. Early on in this lull the people from [TEA protocol](https://app.tea.xyz/) got in touch. It's a new way of funding open source and, while I am sceptical that it will catch on (though I hope I'm wrong), it did get me thinking a bit more about open source and fetch-mock. After 3 months of not touching a text editor I figured I also needed to be careful of not getting too rusty; a conversation with a friend uncovered that I'd forgotten the keyboard shortcut to clear the terminal.

## What I'm working on

I began by setting out some high level principles to guide the work.

1. Be modern - support ESM, native global fetch & types by default. Pay as little attention to supporting other patterns as possible.
2. Avoid making API choices that conflict with current, or future, testing toolchains. Remove any APIs that already conflict.
3. Allow users to use fetch-mock in a way that is idiomatic to their choice of toolchain

Guided by these I came up with a plan of attack:

### 1. Migrate everything to ESM and to global native fetch

This was released as fetch-mock@10 about a month ago

### 2. Turn fetch-mock into a monorepo

This makes it possible to publish multiple packages aimed at different use cases and environments. I now use conventional commits and release-please, which took a while to get right.

I did this last week

### 3. Publish a @fetch-mock/core library

This contains only the functionality that I'm confident other testing tools won't implement, e.g. it does not contain functionality for actually replacing `fetch` with a mock implementation; testing libraries generally have their own APIs for doing that.

I did this a few days ago

### 4. Publish a suite of @fetch-mock libraries

Each will be targeted at a particular toolchain, such as @fetch-mock/standalone, @fetch-mock/jest, @fetch-mock/vitest...

I've not started on this yet.

## Why the new website

Two reasons

1. With the new @fetch-mock suite there'll be a lot more to document, and there'll also need to be very clear separation between legacy (fetch-mock) and modern (@fetch-mock) documentation.
2. Static site generators have come a long way since I first put the fetch-mock site together, so worth looking again at the available tools.

So you are now reading from a new site I put together with docusaurus. I tried astro/starlight too, but it doesn't yet support having multiple different documentation subsites hosted within a single site. Docusaurus does this very well.

While @fetch-mock/core is not really intended for direct use, you _could_ e.g. do something like this in jest.

```js
import fetchMock from '@fetch-mock/core'
jest.mock(global, 'fetch', fetchMock.fetchHandler)

it('works just fine', () => {
	fetchMock.route('http://here.com', 200);
	await expect (fetch('http://here.com')).resolves
})
```

I'd be very happy if people could start giving the library and its docs an experimental little whirl.
