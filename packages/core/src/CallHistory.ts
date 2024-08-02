import { createCallLogFromUrlAndOptions, NormalizedRequestOptions } from './RequestUtils.js';
import { isUrlMatcher, RouteMatcher } from './Matchers.ts';
import { FetchMockConfig } from './FetchMock.ts'
import Route, { RouteName, RouteConfig } from './Route.js';
import Router from './Router.js';

export interface CallLog {
  args: any[];
  url: string;
  options: NormalizedRequestOptions;
  request?: Request;
  signal?: AbortSignal;
  route?: Route;
  response?: Response;
  expressParams?: { [key: string]: string };
  queryParams?: URLSearchParams;
  pendingPromises: Promise<any>[];
}

type Matched = 'matched';
type Unmatched = 'unmatched';
type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;

function isName (filter: CallHistoryFilter): filter is RouteName {
  return typeof filter === 'string' &&
  /^[\da-zA-Z\-]+$/.test(filter) &&
  !['matched', 'unmatched'].includes(filter);
}

function isMatchedOrUnmatched (filter: CallHistoryFilter): filter is Matched | Unmatched | boolean {
  return typeof filter === 'boolean' ||
  ['matched', 'unmatched'].includes(filter as string)
}

class CallHistory {
  callLogs: CallLog[];
  config: FetchMockConfig;
  router: Router;

  constructor(config: FetchMockConfig, router: Router) {
    this.callLogs = [];
    this.config = config;
    this.router = router;
  }

  recordCall(callLog: CallLog): void {
    this.callLogs.push(callLog);
  }

  clear(): void {
    this.callLogs.forEach(({ route }) => route.reset());
    this.callLogs = [];
  }

  async flush(waitForResponseMethods?: boolean): Promise<void> {
    const queuedPromises = this.callLogs.flatMap((call) => call.pendingPromises);
    await Promise.allSettled(queuedPromises);
    if (waitForResponseMethods) {
      await Promise.resolve();
      await this.flush();
    }
  }

  calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[] {
    let calls = [...this.callLogs];
    if (typeof filter === 'undefined' && !options) {
      return calls;
    }

    if (isMatchedOrUnmatched(filter)) {
      if ([true, 'matched'].includes(filter)) {
        calls = calls.filter(({ route }) => !route.config.isFallback);
      } else if ([false, 'unmatched'].includes(filter)) {
        calls = calls.filter(({ route }) => Boolean(route.config.isFallback));
      }

      if (!options) {
        return calls;
      }
    } else if (isName(filter)) {
      calls = calls.filter(({ route: { config: { name } } }) => name === filter);
      if (!options) {
        return calls;
      }
    } else {
      if (isUrlMatcher(filter)) {
        options = { url: filter, ...(options || {}) };
      } else {
        options = { ...filter, ...(options || {}) };
      }
    }

    const { matcher } = new Route({
      response: 'ok',
      ...options,
    });

    calls = calls.filter(({ url, options }) => {
      return matcher(createCallLogFromUrlAndOptions(url, options));
    });

    return calls;
  }

  called(filter: CallHistoryFilter, options: RouteConfig): boolean {
    return Boolean(this.calls(filter, options).length);
  }

  lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog {
    return this.calls(filter, options).pop();
  }

  done(routeNames?: RouteName | RouteName[]): boolean {
    let routesToCheck = this.router.routes;
    if (routeNames) {
      routeNames = Array.isArray(routeNames) ? routeNames : [routeNames];
      routesToCheck = this.router.routes.filter(({ config: { name } }) =>
        routeNames.includes(name)
      );
    }

    return routesToCheck
      .map((route) => {
        const calls = this.callLogs.filter(({ route: routeApplied }) => routeApplied === route);
        if (!calls.length) {
          console.warn(`Warning: ${route.config.name} not called`);
          return false;
        }

        const expectedTimes = route.config.repeat;

        if (!expectedTimes) {
          return true;
        }
        const actualTimes = calls.length;

        if (expectedTimes > actualTimes) {
          console.warn(
            `Warning: ${route.config.name} only called ${actualTimes} times, but ${expectedTimes} expected`
          );
          return false;
        }
        return true;
      })
      .every((isDone) => isDone);
  }
}

export default CallHistory;
