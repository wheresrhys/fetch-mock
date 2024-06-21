//@type-check

export default class Router {
    /**
     * 
     * @param {FetchMockConfig} options.fetchMockConfig
     * @param {Route[]} [options.routes]
     */
    constructor(fetchMockConfig, routes = []) {
        this.routes = routes; // TODO deep clone this
        this.config = fetchMockConfig
    }
    /**
     * 
     * @param {NormalizedRequest} requestOptions 
     * @returns {Boolean}
     */
    needsToReadBody ({ request }) {
        return Boolean(request && this.routes.some(({ usesBody }) => usesBody));
    };


    /**
     * 
     * @param {NormalizedRequest} normalizedRequest 
     * @this {FetchMock}
     * 
     * @returns {{route: Route, callLog: CallLog}}
     */
    execute ({ url, options, request }) {
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
    }

    /**
     * 
     * @param {*} matcher 
     * @param {*} response 
     * @param {*} options 
     * @returns 
     */
    compileRoute (matcher, response, options) {
            return new Route(matcher, response, options, this.config);
        }

    defineMatcher (matcher) {
            Route.defineMatcher(matcher);
        }

    setFallback(response) {
        if (this.fallbackResponse) {
            console.warn(
                'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response',
            ); // eslint-disable-line
        }
        this.fallbackResponse = response || 'ok';
        return this
    }

    removeRoutes ({ force }) {
         force? this.routes = [] : this.routes = this.routes.filter(({ sticky }) => sticky);
    }

    addRoute (matcher, response, options) {
        const route = this.compileRoute(matcher, response, options);
        if (route.name && this.routes.some(({ name: existingName }) => name === existingName)) {
            throw new Error(
                'fetch-mock: Adding route with same name as existing route.',
            );
        }
        // is this needed any more?
        this.routes.push(route);
    };

}


export default Router;