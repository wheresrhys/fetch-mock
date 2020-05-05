---
title: 'Setting cookies in the browser'
navTitle: cookies
position: 10
parentMethodGroup: mocking
content_markdown: |-
  The `Set-Cookie` header is used to set cookies in the browser. This behaviour is part of the [browser/http spec](https://tools.ietf.org/html/rfc6265#section-4.1), not the fetch spec. As fetch-mock prevents requests getting out of js and into the browser, `Set-Cookie` will have no effect.

  The following code samples demonstrate how to replicate the normal cookie setting behaviour when using fetch-mock.

left_code_blocks:
  - title: Set up
    code_block: |-
      fetchMock.get("https://mydomain.com", () => {
        const cookieString = 'mycookie=hello; Max-Age=3600; Path=/;';
        document.cookie = cookieString;
        return { status: 200, headers: { 'Set-Cookie': cookieString }};
      })
    language: javascript
  - title: Tear down
    code_block: |-
      fetchMock.reset();
      document.cookie = 'mycookie=; Max-Age=0'
    language: javascript
---
