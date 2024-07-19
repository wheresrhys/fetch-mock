---

sidebar_position: 3

---
# optionsOrName

Either

- An object containing further options for configuring mocking behaviour.
- A string, which will be used as the route's name

## General options

### name

`{String}`

A unique string naming the route. Used to subsequently retrieve references to the calls handled by it. Only needed for advanced use cases.

### response

Instead of defining the response as the second argument of `mock()`, it can be passed as a property on the first argument. See the [response documentation](#usageapimock_response) for valid values.

### repeat

`{Int}`

Limits the number of times the route can be used. If the route has already been called `repeat` times, the call to `fetch()` will fall through to be handled by any other routes defined (which may eventually result in an error if nothing matches it)

### delay

`{Int}`

Delays responding for the number of milliseconds specified.

### sticky

`{Boolean}`

Avoids a route being removed when `reset()`, `restore()` or `resetBehavior()` are called. _Note - this does not preserve the history of calls to the route_

### sendAsJson

`{Boolean}`

See [global configuration](#usageconfiguration)

### includeContentLength

`{Boolean}`

See [global configuration](#usageconfiguration)

### overwriteRoutes

`{Boolean}`

See [global configuration](#usageconfiguration)


