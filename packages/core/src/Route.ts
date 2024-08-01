import { builtInMatchers } from './Matchers.ts';
import statusTextMap from './StatusTextMap.ts';
import { CallLog } from './CallHistory.ts';
import { FetchMockGlobalConfig, FetchImplementations } from './FetchMock.ts';
import { RouteMatcher,RouteMatcherFunction,RouteMatcherUrl,MatcherDefinition} from './Matchers.ts'

export interface UserRouteConfig {
  name?: RouteName;
  method?: string;
  headers?: { [key: string]: string | number };
  query?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: object;
  matcherFunction?: RouteMatcherFunction;
  url?: RouteMatcherUrl;
  response?: RouteResponse | RouteResponseFunction;
  repeat?: number;
  delay?: number;
  sticky?: boolean;
}

interface InternalRouteConfig {
  usesBody?: boolean;
  isFallback?: boolean;
}

type ExtendedUserRouteConfig = UserRouteConfig & FetchMockGlobalConfig;
export type RouteConfig = ExtendedUserRouteConfig & FetchImplementations & InternalRouteConfig;

interface RouteResponseConfig {
  body?: string | {};
  status?: number;
  headers?: { [key: string]: string };
  throws?: Error;
  redirectUrl?: string;
  options?: ResponseInit;
}

interface ResponseInitUsingHeaders {
  status: number;
  statusText: string;
  headers: Headers;
}

type RouteResponseObjectData = RouteResponseConfig | object;
type RouteResponseData = Response | number | string | RouteResponseObjectData;
type RouteResponsePromise = Promise<RouteResponseData>;
export type RouteResponseFunction = (callLog: CallLog) => RouteResponseData | RouteResponsePromise;
export type RouteResponse = RouteResponseData | RouteResponsePromise | RouteResponseFunction;

export type RouteName = string;

function sanitizeStatus(status?: number): number {
  if (!status) {
    return 200;
  }

  if (
    (typeof status === 'number' &&
      parseInt(String(status), 10) !== status &&
      status >= 200) ||
    status < 600
  ) {
    return status;
  }

  throw new TypeError(`fetch-mock: Invalid status ${status} passed on response object.
To respond with a JSON object that has status as a property assign the object to body
e.g. {"body": {"status: "registered"}}`);
}

class Route {
  config: RouteConfig = {};
  matcher: RouteMatcherFunction | null = null;

  constructor(config: RouteConfig) {
    this.config = config;
    this.#sanitize();
    this.#validate();
    this.#generateMatcher();
    this.#limit();
    this.#delayResponse();
  }

  reset(): void {}

  #validate(): void {
    if (['matched', 'unmatched'].includes(this.config.name)) {
      throw new Error(
        `fetch-mock: Routes cannot use the reserved name \`${this.config.name}\``,
      );
    }
    if (!('response' in this.config)) {
      throw new Error('fetch-mock: Each route must define a response');
    }
    if (!Route.registeredMatchers.some(({ name }) => name in this.config)) {
      throw new Error(
        "fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'",
      );
    }
  }

  #sanitize(): void {
    if (this.config.method) {
      this.config.method = this.config.method.toLowerCase();
    }
  }

  #generateMatcher(): void {
    const activeMatchers = Route.registeredMatchers
      .filter(({ name }) => name in this.config)
      .map(({ matcher, usesBody }) => ({
        matcher: matcher(this.config),
        usesBody,
      }));
    this.config.usesBody = activeMatchers.some(({ usesBody }) => usesBody);
    this.matcher = (normalizedRequest) =>
      activeMatchers.every(({ matcher }) => matcher(normalizedRequest));
  }

  #limit(): void {
    if (!this.config.repeat) {
      return;
    }
    const originalMatcher = this.matcher;
    let timesLeft = this.config.repeat;
    this.matcher = (callLog) => {
      const match = timesLeft && originalMatcher(callLog);
      if (match) {
        timesLeft--;
        return true;
      }
    };
    this.reset = () => {
      timesLeft = this.config.repeat;
    };
  }

  #delayResponse(): void {
    if (this.config.delay) {
      const { response } = this.config;
      this.config.response = () => {
        return new Promise((res) =>
          setTimeout(() => res(response), this.config.delay),
        );
      };
    }
  }

  constructResponse(responseInput: RouteResponseConfig): { response: Response, responseOptions: ResponseInit, responseInput: RouteResponseConfig } {
    const responseOptions = this.constructResponseOptions(responseInput);
    const body = this.constructResponseBody(responseInput, responseOptions);

    return {
      response: new this.config.Response(body, responseOptions),
      responseOptions,
      responseInput,
    };
  }

  constructResponseOptions(responseInput: RouteResponseConfig): ResponseInitUsingHeaders {
    const options = responseInput.options || {};
    options.status = sanitizeStatus(responseInput.status);
    options.statusText = statusTextMap[options.status];
    options.headers = new this.config.Headers(responseInput.headers);
    return options;
  }

  constructResponseBody(responseInput: RouteResponseConfig, responseOptions: ResponseInitUsingHeaders): string | null {
    let body = responseInput.body;
    if (typeof body === 'object') {
      if (
        this.config.sendAsJson &&
        responseInput.body != null
      ) {
        body = JSON.stringify(body);
        if (!responseOptions.headers.has('Content-Type')) {
          responseOptions.headers.set('Content-Type', 'application/json');
        }
      }
    }

    if (typeof body === 'string') {
      if (
        this.config.includeContentLength &&
        !responseOptions.headers.has('Content-Length')
      ) {
        responseOptions.headers.set('Content-Length', body.length.toString());
      }
      return body;
    }
    return body || null;
  }

  static defineMatcher(matcher: MatcherDefinition): void {
    Route.registeredMatchers.push(matcher);
  }

  static registeredMatchers: MatcherDefinition[] = [];
}

builtInMatchers.forEach(Route.defineMatcher);

export default Route;
