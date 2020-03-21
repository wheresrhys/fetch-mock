---
title: ".addMatcher({name, usesBody, matcher})"
navTitle: .addMatcher()
position: 1.9
description: |-
  Allows adding your own, reusable custom matchers to fetch-mock, for example a matcher for interacting with GraphQL queries, or an `isAuthorized` matcher that encapsulates the exact authorization conditions for the API you are mocking, and only requires a `true` or `false` to be input
parentMethodGroup: mocking
parametersBlockTitle: Option values
parentMethodGroup: mocking
parameters:
  - name: name
    types:
      - String
    content: |
        The name of your matcher. This will be the name of the property used to hold any input to your matcher.
    examples:
      - '"*"'
  - name: usesBody
    types:
      - Boolean
    content: |
        If your matcher requires access to the body of the request set this to true; because body can, in some cases, only be accessed by fetch-mock asynchronously, you will need to provide this hint in order to make sure the correct code paths are followed.
  - name: matcher
    types:
      - Function
    content: |
        A function which takes a route definition object as input, and returns a function of the signature `(url, options, request) => Boolean`. See the examples below for more detail
left_code_blocks:
  - title: Authorization example
    code_block: |-
        fetchMock
          .addMatcher({
            name: 'isAuthorized',
            matcher: ({isAuthorized}) => (url, options) => {
                const actuallyIsAuthorized = options.headers && options.headers.auth;
                return isAuthorized ? actuallyIsAuthorized : !actuallyIsAuthorized;
            } 
          })
          .mock({isAuthorized: true}, 200)
          .mock({isAuthorized: false}, 401)
    language: javascript
  - title: GraphQL example
    code_block: |-
        fetchMock
          .addMatcher({
            name: 'graphqlVariables',
            matcher: ({graphqlVariables}) => (url, options) => {
                if (!/\/graphql$/.test(url)) {
                    return false;
                }
                const body = JSON.parse(options.body)
                return body.variables && Object.keys(body.variables).length === Object.keys(body.graphqlVariables).length && Object.entries(graphqlVariables).every(([key, val]) => body.variables[key] === val)
            } 
          })
          .mock({graphqlVariables: {owner: 'wheresrhys'}}, {data: {account: {
            name: 'wheresrhys',
            repos: [ ... ]
            }}})
        
    language: javascript
---
