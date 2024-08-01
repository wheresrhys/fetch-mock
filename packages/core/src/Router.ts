import { isUrlMatcher, isFunctionMatcher, RouteMatcher } from './Matchers.ts';
import Route, {UserRouteConfig,RouteConfig,RouteResponse,RouteResponseData,RouteResponseObjectData,RouteResponseConfig,RouteResponseFunction} from './Route';
import {FetchMockConfig, FetchMock} from './FetchMock.ts';
import {CallLog} from './CallHistory.ts';

type ResponseConfigProp = 'body' | 'headers' | 'throws' | 'status' | 'redirectUrl';

const responseConfigProps: ResponseConfigProp[] = [
    'body',
    'headers',
    'throws',
    'status',
    'redirectUrl',
];

const nameToOptions = (options: RouteConfig | string): RouteConfig =>
    typeof options === 'string' ? { name: options } : options;

const isPromise = (response: RouteResponse): response is RouteResponseFunction =>
    typeof (response as Promise<any>).then === 'function';

function normalizeResponseInput(responseInput: RouteResponseData): RouteResponseConfig {
    if (typeof responseInput === 'number') {
        return {
            status: responseInput,
        };
    } else if (
        typeof responseInput === 'string' ||
        shouldSendAsObject(responseInput)
    ) {
        return {
            body: responseInput,
        };
    }
    return responseInput as RouteResponseConfig;
}

function shouldSendAsObject(responseInput: RouteResponseData): boolean {
    if (
        responseConfigProps.some(
            (prop) => (responseInput as RouteResponseConfig)[prop],
        )
    ) {
        if (
            Object.keys(responseInput).every((key) =>
                responseConfigProps.includes(key as ResponseConfigProp),
            )
        ) {
            return false;
        }
        return true;
    }
    return true;
}

function throwSpecExceptions({ url, options: { headers, method, body } }: CallLog): void {
    if (headers) {
        Object.entries(headers).forEach(([key]) => {
            if (/\s/.test(key)) {
                throw new TypeError('Invalid name');
            }
        });
    }
    const urlObject = new URL(url);
    if (urlObject.username || urlObject.password) {
        throw new TypeError(
            `Request cannot be constructed from a URL that includes credentials: ${url}`,
        );
    }

    if (['get', 'head'].includes(method) && body) {
        throw new TypeError('Request with GET/HEAD method cannot have body.');
    }
}

const resolveUntilResponseConfig = async (callLog: CallLog): Promise<RouteResponseConfig> => {
    let response = callLog.route.config.response;
    while (true) {
        if (typeof response === 'function') {
            response = response(callLog);
        } else if (isPromise(response)) {
            response = await response;
        } else {
            return response;
        }
    }
};

export default class Router {
    routes: Route[] = [];
    config: FetchMockConfig;
    fallbackRoute?: Route;

    constructor(fetchMockConfig: FetchMockConfig, { routes, fallbackRoute }: { routes?: Route[], fallbackRoute?: Route } = {}) {
        this.config = fetchMockConfig;
        this.routes = routes || [];
        this.fallbackRoute = fallbackRoute;
    }

    needsToReadBody(request: Request): boolean {
        return Boolean(
            request && this.routes.some((route) => route.config.usesBody),
        );
    }

    execute(callLog: CallLog): Promise<Response> {
        throwSpecExceptions(callLog);
        return new Promise(async (resolve, reject) => {
            const { url, options, request, pendingPromises } = callLog;
            if (callLog.signal) {
                const abort = () => {
                    const error = new DOMException(
                        'The operation was aborted.',
                        'AbortError',
                    );

                    const requestBody = request?.body || options?.body;
                    if (requestBody instanceof ReadableStream) {
                        requestBody.cancel(error);
                    }

                    if (callLog?.response?.body) {
                        callLog.response.body.cancel(error);
                    }
                    reject(error);
                };
                if (callLog.signal.aborted) {
                    abort();
                }
                callLog.signal.addEventListener('abort', abort);
            }
            if (this.needsToReadBody(request)) {
                options.body = await options.body;
            }

            const routesToTry = this.fallbackRoute
                ? [...this.routes, this.fallbackRoute]
                : this.routes;
            const route = routesToTry.find((route) => route.matcher(callLog));
            if (route) {
                try {
                    callLog.route = route;
                    const { response, responseOptions, responseInput } =
                        await this.generateResponse(callLog);
                    const observableResponse = this.createObservableResponse(
                        response,
                        responseOptions,
                        responseInput,
                        url,
                        pendingPromises,
                    );
                    callLog.response = response;
                    resolve(observableResponse);
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(
                    new Error(
                        `fetch-mock: No response or fallback rule to cover ${
                            (options && options.method) || 'GET'
                        } to ${url}`,
                    ),
                );
            }
        });
    }

    async generateResponse(callLog: CallLog): Promise<{ response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig }> {
        const responseInput = await resolveUntilResponseConfig(callLog);
        if (responseInput instanceof Response) {
            return {
                response: responseInput,
                responseOptions: {},
                responseInput: {},
            };
        }

        const responseConfig = normalizeResponseInput(responseInput);

        if (responseConfig.throws) {
            throw responseConfig.throws;
        }

        return callLog.route.constructResponse(responseConfig);
    }

    createObservableResponse(
        response: Response,
        responseConfig: ResponseInit,
        responseInput: RouteResponseConfig,
        responseUrl: string,
        pendingPromises: Promise<any>[],
    ): Response {
        return new Proxy(response, {
            get: (originalResponse, name) => {
                if (responseInput.redirectUrl) {
                    if (name === 'url') {
                        return responseInput.redirectUrl;
                    }

                    if (name === 'redirected') {
                        return true;
                    }
                } else {
                    if (name === 'url') {
                        return responseUrl;
                    }
                    if (name === 'redirected') {
                        return false;
                    }
                }
                if (typeof response[name] === 'function') {
                    return new Proxy(response[name], {
                        apply: (matcherFunction, thisArg, args) => {
                            const result = matcherFunction.apply(response, args);
                            if (result.then) {
                                pendingPromises.push(
                                    result.catch(() => undefined),
                                );
                            }
                            return result;
                        },
                    });
                }
                return originalResponse[name];
            },
        });
    }

    addRoute(matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, nameOrOptions?: UserRouteConfig | string): void {
        const config: RouteConfig = {};
        if (isUrlMatcher(matcher)) {
            config.url = matcher;
        } else if (isFunctionMatcher(matcher)) {
            config.matcherFunction = matcher;
        } else {
            Object.assign(config, matcher);
        }

        if (typeof response !== 'undefined') {
            config.response = response;
        }

        if (nameOrOptions) {
            Object.assign(
                config,
                typeof nameOrOptions === 'string'
                    ? nameToOptions(nameOrOptions)
                    : nameOrOptions,
            );
        }

        const route = new Route({
            ...this.config,
            ...config,
        });

        if (
            route.config.name &&
            this.routes.some(
                ({ config: { name: existingName } }) =>
                    route.config.name === existingName,
            )
        ) {
            throw new Error(
                'fetch-mock: Adding route with same name as existing route.',
            );
        }
        this.routes.push(route);
    }

    setFallback(response?: RouteResponse): void {
        if (this.fallbackRoute) {
            console.warn(
                'calling fetchMock.catch() twice - are you sure you want to overwrite the previous fallback response',
            );
        }

        this.fallbackRoute = new Route({
            matcherFunction: () => true,
            response: response || 'ok',
            ...this.config,
        });
        this.fallbackRoute.config.isFallback = true;
    }

    removeRoutes({ names, includeSticky, includeFallback }: { names?: string[], includeSticky?: boolean, includeFallback?: boolean } = {}): void {
        includeFallback = includeFallback ?? true;
        this.routes = this.routes.filter(({ config: { sticky, name } }) => {
            if (sticky && !includeSticky) {
                return true;
            }
            if (!names) {
                return false;
            }
            return !names.includes(name);
        });
        if (includeFallback) {
            delete this.fallbackRoute;
        }
    }
}
