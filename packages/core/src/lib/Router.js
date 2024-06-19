Router.needsAsyncBodyExtraction = function ({ request }) {
    return request && this.routes.some(({ usesBody }) => usesBody);
};


FetchHandler.executeRouter = function (url, options, request) {
    const callLog = {
        url,
        options,
        request,
        isUnmatched: true,
    };
    if (this.getOption('fallbackToNetwork') === 'always') {
        return {
            route: { response: this.getNativeFetch(), responseIsFetch: true },
            // BUG - this callLog never used to get sent. Discovered the bug
            // but can't fix outside a major release as it will potentially
            // cause too much disruption
            //
            // callLog,
        };
    }

    const route = this.router(url, options, request);

    if (route) {
        return {
            route,
            callLog: {
                url,
                options,
                request,
                identifier: route.identifier,
            },
        };
    }

    if (this.getOption('warnOnFallback')) {
        console.warn(`Unmatched ${(options && options.method) || 'GET'} to ${url}`); // eslint-disable-line
    }

    if (this.fallbackResponse) {
        return { route: { response: this.fallbackResponse }, callLog };
    }

    if (!this.getOption('fallbackToNetwork')) {
        throw new Error(
            `fetch-mock: No fallback response defined for ${(options && options.method) || 'GET'
            } to ${url}`,
        );
    }
    return {
        route: { response: this.getNativeFetch(), responseIsFetch: true },
        callLog,
    };
};

FetchHandler.router = function (url, options, request) {
    const route = this.routes.find((route, i) => {
        return route.matcher(url, options, request);
    });

    if (route) {
        return route;
    }
};


FetchMock.compileRoute = function (config) {
    return new Route(config, this);
};

FetchMock.addMatcher = function (matcher) {
    Route.addMatcher(matcher);
};

const getRouteRemover =
    ({ sticky: removeStickyRoutes }) =>
        (routes) =>
            removeStickyRoutes ? [] : routes.filter(({ sticky }) => sticky);





FetchMock.addRoute = function (uncompiledRoute) {
    const route = this.compileRoute(uncompiledRoute);
    const clashes = this.routes.filter(({ identifier, method }) => {
        const isMatch =
            typeof identifier === 'function'
                ? identifier === route.identifier
                : String(identifier) === String(route.identifier);
        return isMatch && (!method || !route.method || method === route.method);
    });

    if (this.getOption('overwriteRoutes', route) === false || !clashes.length) {
        this._uncompiledRoutes.push(uncompiledRoute);
        return this.routes.push(route);
    }

    if (this.getOption('overwriteRoutes', route) === true) {
        clashes.forEach((clash) => {
            const index = this.routes.indexOf(clash);
            this._uncompiledRoutes.splice(index, 1, uncompiledRoute);
            this.routes.splice(index, 1, route);
        });
        return this.routes;
    }

    if (clashes.length) {
        throw new Error(
            'fetch-mock: Adding route with same name or matcher as existing route. See `overwriteRoutes` option.',
        );
    }

    this._uncompiledRoutes.push(uncompiledRoute);
    this.routes.push(route);
};



FetchMock.catch = function (response) {
    if (this.fallbackResponse) {
        console.warn(
            'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response',
        ); // eslint-disable-line
    }
    this.fallbackResponse = response || 'ok';
    return this._mock();
};

const defineShorthand = (methodName, underlyingMethod, shorthandOptions) => {
    FetchMock[methodName] = function (matcher, response, options) {
        return this[underlyingMethod](
            matcher,
            response,
            Object.assign(options || {}, shorthandOptions),
        );
    };
};

const defineGreedyShorthand = (methodName, underlyingMethod) => {
    FetchMock[methodName] = function (response, options) {
        return this[underlyingMethod]({}, response, options);
    };
};

defineShorthand('sticky', 'mock', { sticky: true });
defineShorthand('once', 'mock', { repeat: 1 });
defineGreedyShorthand('any', 'mock');
defineGreedyShorthand('anyOnce', 'once');

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach((method) => {
    defineShorthand(method, 'mock', { method });
    defineShorthand(`${method}Once`, 'once', { method });
    defineGreedyShorthand(`${method}Any`, method);
    defineGreedyShorthand(`${method}AnyOnce`, `${method}Once`);
});