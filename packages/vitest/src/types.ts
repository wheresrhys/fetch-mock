import type {
	CallHistoryFilter,
	FetchMock,
	RouteName,
	UserRouteConfig,
} from 'fetch-mock';
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
export type ToHaveFunc<R> = (
	filter?: CallHistoryFilter,
	options?: UserRouteConfig,
) => R;

/**
 * Verify that a particular Nth call for the HTTP method implied in the function name
 * has occurred
 */
export type ToHaveNthFunc<R> = (
	n: number,
	filter?: CallHistoryFilter,
	options?: UserRouteConfig,
) => R;

/**
 * Verify that a particular call for the HTTP method implied in the function name
 * has been made N times
 */
export type ToHaveTimesFunc<R> = (
	times: number,
	filter?: CallHistoryFilter,
	options?: UserRouteConfig,
) => R;

/**
 * Verify that a particular route names(s) has been called
 */
export type ToBeDoneFunc<R> = (routes?: RouteName | RouteName[]) => R;

export type FetchMockMatchers<R = void> = {
	toHaveFetched: ToHaveFunc<R>;
	toHaveLastFetched: ToHaveFunc<R>;
	toHaveFetchedTimes: ToHaveTimesFunc<R>;
	toHaveNthFetched: ToHaveNthFunc<R>;
	toHaveGot: ToHaveFunc<R>;
	toHaveLastGot: ToHaveFunc<R>;
	toHaveGotTimes: ToHaveTimesFunc<R>;
	toHaveNthGot: ToHaveNthFunc<R>;
	toHavePosted: ToHaveFunc<R>;
	toHaveLastPosted: ToHaveFunc<R>;
	toHavePostedTimes: ToHaveTimesFunc<R>;
	toHaveNthPosted: ToHaveNthFunc<R>;
	toHavePut: ToHaveFunc<R>;
	toHaveLastPut: ToHaveFunc<R>;
	toHavePutTimes: ToHaveTimesFunc<R>;
	toHaveNthPut: ToHaveNthFunc<R>;
	toHaveDeleted: ToHaveFunc<R>;
	toHaveLastDeleted: ToHaveFunc<R>;
	toHaveDeletedTimes: ToHaveTimesFunc<R>;
	toHaveNthDeleted: ToHaveNthFunc<R>;
	toHaveFetchedHead: ToHaveFunc<R>;
	toHaveLastFetchedHead: ToHaveFunc<R>;
	toHaveFetchedHeadTimes: ToHaveTimesFunc<R>;
	toHaveNthFetchedHead: ToHaveNthFunc<R>;
	toHavePatched: ToHaveFunc<R>;
	toHaveLastPatched: ToHaveFunc<R>;
	toHavePatchedTimes: ToHaveTimesFunc<R>;
	toHaveNthPatched: ToHaveNthFunc<R>;
	toBeDone: ToBeDoneFunc<R>;
};

// types for use doing some intermediate type checking in extensions to make sure things don't get out of sync
/**
 * This reflects the Object.assign that FetchMock does on the fetch function
 */
export type PatchedFetch = {
	fetchMock: FetchMock;
};

/**
 * This type allows us to take the Matcher type and creat another one
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawMatcher<T extends (...args: any[]) => any> = (
	input: PatchedFetch | FetchMock,
	...args: Parameters<T>
) => ReturnType<T>;

export type RawFetchMockMatchers = {
	[k in keyof FetchMockMatchers<SyncExpectationResult>]: RawMatcher<
		FetchMockMatchers<SyncExpectationResult>[k]
	>;
};

export type HumanVerbMethodNames<M extends HumanVerbs> =
	| `toHave${M}`
	| `toHaveLast${M}`
	| `toHave${M}Times`
	| `toHaveNth${M}`;
