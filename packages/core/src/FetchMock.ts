import Router from './Router.js';
import Route, { RouteName, UserRouteConfig, RouteResponse } from './Route.js';
import CallHistory, { CallLog } from './CallHistory.ts';
import { createCallLogFromRequest, createCallLogFromUrlAndOptions } from './RequestUtils.ts';
import { MatcherDefinition, RouteMatcher } from './Matchers.ts'

export interface FetchMockGlobalConfig {
  sendAsJson?: boolean;
  includeContentLength?: boolean;
  matchPartialBody?: boolean;
}

export interface FetchImplementations {
  fetch?: typeof fetch;
  Headers?: typeof Headers;
  Request?: typeof Request;
  Response?: typeof Response;
}

export type FetchMockConfig = FetchMockGlobalConfig & FetchImplementations;

const defineShorthand = (shorthandOptions: UserRouteConfig) => {
  return function (this: FetchMock, matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string) {
    return this.route(
      matcher,
      response,
      Object.assign(options || {}, shorthandOptions),
    );
  };
};

const defineGreedyShorthand = (shorthandOptions: UserRouteConfig) => {
  return function (this: FetchMock, response: RouteResponse, options?: UserRouteConfig | string) {
    return this.route(
      '*',
      response,
      Object.assign(options || {}, shorthandOptions),
    );
  };
};

export class FetchMock {
  config: FetchMockConfig;
  router: Router;
  callHistory: CallHistory;

  constructor(config: FetchMockConfig, router?: Router) {
    this.config = config;
    this.router = new Router(this.config, {
      routes: router ? [...router.routes] : [],
      fallbackRoute: router ? router.fallbackRoute : null,
    });
    this.callHistory = new CallHistory(this.config, this.router);
  }

  createInstance(): FetchMock {
    return new FetchMock({ ...this.config }, this.router);
  }

  async fetchHandler(requestInput: string | URL | Request, requestInit?: RequestInit): Promise<Response> {
    let callLog: CallLog;

    if (requestInput instanceof this.config.Request) {
      callLog = await createCallLogFromRequest(
        requestInput,
        requestInit,
      );
    } else {
      callLog = createCallLogFromUrlAndOptions(
        requestInput,
        requestInit,
      );
    }

    this.callHistory.recordCall(callLog);
    const responsePromise = this.router.execute(callLog);
    callLog.pendingPromises.push(responsePromise);
    return responsePromise;
  }

  route(matcher: RouteMatcher | UserRouteConfig, response?: RouteResponse, options?: UserRouteConfig | string): FetchMock {
    this.router.addRoute(matcher, response, options);
    return this;
  }

  catch(response: RouteResponse): FetchMock {
    this.router.setFallback(response);
    return this;
  }

  defineMatcher(matcher: MatcherDefinition): void {
    Route.defineMatcher(matcher);
  }

  removeRoutes(options?: { names?: string[]; includeSticky?: boolean; includeFallback?: boolean }): FetchMock {
    this.router.removeRoutes(options);
    return this;
  }

  clearHistory(): FetchMock {
    this.callHistory.clear();
    return this;
  }

  sticky = defineShorthand({ sticky: true });
  once = defineShorthand({ repeat: 1 });
  any = defineGreedyShorthand({});
  anyOnce = defineGreedyShorthand({ repeat: 1 });
  get = defineShorthand({ method: 'get' });
  getOnce = defineShorthand({ method: 'get', repeat: 1 });
  post = defineShorthand({ method: 'post' });
  postOnce = defineShorthand({ method: 'post', repeat: 1 });
  put = defineShorthand({ method: 'put' });
  putOnce = defineShorthand({ method: 'put', repeat: 1 });
  delete = defineShorthand({ method: 'delete' });
  deleteOnce = defineShorthand({ method: 'delete', repeat: 1 });
  head = defineShorthand({ method: 'head' });
  headOnce = defineShorthand({ method: 'head', repeat: 1 });
  patch = defineShorthand({ method: 'patch' });
  patchOnce = defineShorthand({ method: 'patch', repeat: 1 });
}

class FetchMockStandalone extends FetchMock {
  mockGlobal(): FetchMockStandalone {
    globalThis.fetch = this.fetchHandler.bind(this);
    return this;
  }

  unmockGlobal(): FetchMockStandalone {
    globalThis.fetch = this.config.fetch;
    return this;
  }

  spy(matcher?: RouteMatcher | UserRouteConfig, name?: RouteName): FetchMockStandalone {
    if (matcher) {
      this.route(matcher, ({ args }) => this.config.fetch(...(args as [requestInput: string | URL | Request, requestInit?: RequestInit])), name);
    } else {
      this.catch(({ args }) => this.config.fetch(...(args as [requestInput: string | URL | Request, requestInit?: RequestInit])));
    }
    return this;
  }

  spyGlobal(): FetchMockStandalone {
    this.mockGlobal();
    return this.spy();
  }

  createInstance(): FetchMockStandalone {
    return new FetchMockStandalone({ ...this.config }, this.router);
  }
}

const fetchMock = new FetchMockStandalone({
  includeContentLength: true,
  sendAsJson: true,
  matchPartialBody: false,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  fetch: globalThis.fetch,
});

export default fetchMock;
