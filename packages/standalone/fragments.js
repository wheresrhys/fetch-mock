FetchHandler.getNativeFetch = function () {
    const func = this.realFetch || (this.isSandbox && this.config.fetch);
    if (!func) {
        throw new Error(
            'fetch-mock: Falling back to network only available on global fetch-mock, or by setting config.fetch on sandboxed fetch-mock',
        );
    }
    return func;
};


FetchMock.resetBehavior = function (options = {}) {
    const removeRoutes = getRouteRemover(options);

    this.routes = removeRoutes(this.routes);
    this._uncompiledRoutes = removeRoutes(this._uncompiledRoutes);

    if (this.realFetch && !this.routes.length) {
        globalThis.fetch = this.realFetch;
        this.realFetch = undefined;
    }

    this.fallbackResponse = undefined;
    return this;
};

FetchMock.resetHistory = function () {
    this._calls = [];
    this._holdingPromises = [];
    this.routes.forEach((route) => route.reset && route.reset());
    return this;
};

FetchMock.restore = FetchMock.reset = function (options) {
    this.resetBehavior(options);
    this.resetHistory();
    return this;
};

FetchMock._mock = function () {
    if (!this.isSandbox) {
        // Do this here rather than in the constructor to ensure it's scoped to the test
        this.realFetch = this.realFetch || globalThis.fetch;
        globalThis.fetch = this.fetchHandler;
    }
    return this;
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