# fetch-mock
Mock http requests made using fetch (or isomorphic-fetch)

fetchMock.registerRoute(name, matcher, response) or array of {name, matcher, response} objects

name - string
matcher - string, regex or func expecting (url, opts) params
response - func or obj with body & opts props (like what's expected by fetch.Response constructor)

fetchMock.unregisterRoute(name) or array of names
 - as you'd expect
 - if nothing passed unregisters all routes

fetchMock.mock(opts)
opts.greedy - stop unmatched routes from making http requests, responding instead with error promise. defaults to true
opts.routes - array of registered route names and route config objects to try to mock. Defaults to all previously registered ones
opts.responses - array of name/object pairs to override the standard response (useful for when normally you want a property to be truthy but for one test it must be falsy)

fetchMock.restore()
- similar to sinon.spy.restore()

fetchMock.reset()
- similar to sinon.spy.reset()

fetchMock.args(name)
- similar to sinon.spy.args(), but restricted to a named route

fetch itself becomes a sinon.spy for more fine-grained call analysis where needed