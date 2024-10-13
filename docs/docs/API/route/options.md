---
sidebar_position: 3
---

# options

An object containing further options for configuring mocking behaviour.

## Options

### name

`{String}`

A unique string naming the route. Used to subsequently retrieve references to the calls handled by it. Only needed for advanced use cases.

### response

When using pattern 3. above, `response` can be passed as a property on the options object. See the [response documentation](#usageapimock_response) for valid values.

### repeat

`{Int}`

Limits the number of times the route will be used to respond. If the route has already been called `repeat` times, the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it).

### delay

`{Int}`

Delays responding for the number of milliseconds specified.

### sticky

`{Boolean}`

Avoids a route being removed when `removeRoutes()` is called.

### sendAsJson

`{Boolean}`

See [global configuration](#usageconfiguration)

### includeContentLength

`{Boolean}`

See [global configuration](#usageconfiguration)
