//@type-check
Router.needsToReadBody = function ({ request }) {
    return request && this.routes.some(({ usesBody }) => usesBody);
};

Router.executeRouter = function (url, options, request) {
    const callLog = {
        url,
        options,
        request,
        isUnmatched: true,
    };

    const route = this.routes.find((route) => route.matcher(url, options, request));

    if (route) {
        return {
            route,
            callLog: {
                url,
                options,
                request,
            },
        };
    }

    if (this.config.warnOnFallback) {
        console.warn(`Unmatched ${(options && options.method) || 'GET'} to ${url}`); // eslint-disable-line
    }

    if (this.fallbackResponse) {
        return { route: { response: this.fallbackResponse }, callLog };
    }

    throw new Error(
        `fetch-mock: No response or fallback rule to cover ${(options && options.method) || 'GET'
        } to ${url}`,
    );
};

Router.compileRoute = function (matcher, response, options) {
    return new Route(matcher, response, options, this.config);
};

Router.defineMatcher = function (matcher) {
    Route.defineMatcher(matcher);
};

Router.removeRoutes ({force}) = force ? this.routes = [] : this.routes = this.routes.filter(({ sticky }) => sticky);
/**
 * 
 * @param {} matcher 
 * @param {*} response 
 * @param {*} options 
 * @returns 
 */
Router.route = function(matcher, response, options) {
    return this.addRoute(matcher, response, options)
}

Router.addRoute = function (matcher, response, options) {
    const route = this.compileRoute(matcher, response, options);
    if (route.name && this.routes.some(({ name: existingName }) => name === existingName)) {
        throw new Error(
            'fetch-mock: Adding route with same name as existing route.',
        );
    }
    // is this needed any more?
    this.routes.push(route);
};


Router.catch = function (response) {
    if (this.fallbackResponse) {
        console.warn(
            'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response',
        ); // eslint-disable-line
    }
    this.fallbackResponse = response || 'ok';
    return this
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

defineShorthand('sticky', 'addRoute', { sticky: true });
defineShorthand('once', 'addRoute', { repeat: 1 });
defineGreedyShorthand('any', 'addRoute');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
    defineShorthand(method, 'addRoute', { method });
    defineShorthand(`${method}Once`, 'once', { method });
    defineGreedyShorthand(`${method}Any`, method);
    defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
});