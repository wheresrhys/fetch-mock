import type { CallHistoryFilter, FetchMock, UserRouteConfig } from 'fetch-mock';
import type { SyncExpectationResult } from 'expect';

export type HumanVerbs =
	| 'Got'
	| 'Posted'
	| 'Put'
	| 'Deleted'
	| 'FetchedHead'
	| 'Patched'
	| 'Fetched';

/**
 * Verify that a particular call for the HTTP method implied in the function name
 * has occurred
 */
export type ToHaveFunc = (
	filter: CallHistoryFilter,
	options: UserRouteConfig,
) => SyncExpectationResult;

/**
 * Verify that a particular Nth call for the HTTP method implied in the function name
 * has occurred
 */
export type ToHaveNthFunc = (
	n: number,
	filter: CallHistoryFilter,
	options: UserRouteConfig,
) => SyncExpectationResult;

/**
 * Verify that a particular call for the HTTP method implied in the function name
 * has been made N times
 */
export type ToHaveTimesFunc = (
	times: number,
	filter: CallHistoryFilter,
	options: UserRouteConfig,
) => SyncExpectationResult;

export type FetchMockMatchers = {
	toHaveFetched: ToHaveFunc;
	toHaveLastFetched: ToHaveFunc;
	toHaveFetchedTimes: ToHaveTimesFunc;
	toHaveNthFetched: ToHaveNthFunc;
	toHaveGot: ToHaveFunc;
	toHaveLastGot: ToHaveFunc;
	toHaveGotTimes: ToHaveTimesFunc;
	toHaveNthGot: ToHaveNthFunc;
	toHavePosted: ToHaveFunc;
	toHaveLastPosted: ToHaveFunc;
	toHavePostedTimes: ToHaveTimesFunc;
	toHaveNthPosted: ToHaveNthFunc;
	toHavePut: ToHaveFunc;
	toHaveLastPut: ToHaveFunc;
	toHavePutTimes: ToHaveTimesFunc;
	toHaveNthPut: ToHaveNthFunc;
	toHaveDeleted: ToHaveFunc;
	toHaveLastDeleted: ToHaveFunc;
	toHaveDeletedTimes: ToHaveTimesFunc;
	toHaveNthDeleted: ToHaveNthFunc;
	toHaveFetchedHead: ToHaveFunc;
	toHaveLastFetchedHead: ToHaveFunc;
	toHaveFetchedHeadTimes: ToHaveTimesFunc;
	toHaveNthFetchedHead: ToHaveNthFunc;
	toHavePatched: ToHaveFunc;
	toHaveLastPatched: ToHaveFunc;
	toHavePatchedTimes: ToHaveTimesFunc;
	toHaveNthPatched: ToHaveNthFunc;
};

// types for use doing some intermediate type checking in extensions to make sure things don't get out of sync
/**
 * This type allows us to take the Matcher type and creat another one
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawMatcher<T extends (...args: any[]) => any> = (
	input: { fetchMock: FetchMock },
	...args: Parameters<T>
) => ReturnType<T>;

export type RawFetchMockMatchers = {
	[k in keyof FetchMockMatchers]: RawMatcher<FetchMockMatchers[k]>;
};

export type HumanVerbMethodNames<M extends HumanVerbs> =
	| `toHave${M}`
	| `toHaveLast${M}`
	| `toHave${M}Times`
	| `toHaveNth${M}`;
