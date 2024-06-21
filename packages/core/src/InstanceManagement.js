//@type-check
import fetchHandler from './FetchHandler.js';
// import inspecting from './inspecting.js';

/** @type {FetchMockConfig} */
const defaultConfig  = {
    includeContentLength: true,
    sendAsJson: true,
    warnOnFallback: true,
    Request: globalThis.Request,
    Response: globalThis.Response,
    Headers: globalThis.Headers,
    fetch: globalThis.fetch,
};
const FetchMock = { 
    // ...fetchHandler, ...setUpAndTearDown, ...inspecting
    config: defaultConfig ,
    createInstance () {
        const instance = Object.create(FetchMock);
        this.fetchHandler = fetchHandler.bind(this);
        instance.router = this.router.clone()
        instance.callHistory = this.callHistory.clone()
        return instance;
    }
};


/**
 * 
 * @param {RouteMatcher} matcher 
 * @param {RouteResponse} response 
 * @param {RouteOptions} options 
 * @returns 
 */
Router.route = function (matcher, response, options) {
    return this.router.addRoute(matcher, response, options)
}
Router.catch = function (response) {
    this.router.setFallback(response)
};

const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
    Router[methodName] = function (matcher, response, options) {
        return this[underlyingMethod](
            matcher,
            response,
            Object.assign(options || {}, shorthandOptions),
        );
    };
};

const defineGreedyShorthand = (methodName, underlyingMethod) => {
    Router[methodName] = function (response, options) {
        return this[underlyingMethod]({}, response, options);
    };
};

defineShorthand('sticky', 'route', { sticky: true });
defineShorthand('once', 'route', { repeat: 1 });
defineGreedyShorthand('any', 'route');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
    defineShorthand(method, 'route', { method });
    defineShorthand(`${method}Once`, 'once', { method });
    defineGreedyShorthand(`${method}Any`, method);
    defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
});

export default FetchMock.createInstance();