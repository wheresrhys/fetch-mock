import { InspectionFilter, InspectionOptions, FetchMockStatic, MockCall, FetchMockSandbox } from 'fetch-mock';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
      toHaveLastFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
      toHaveNthFetched(n: number, filter?: InspectionFilter, options?: InspectionOptions): R;
      toHaveFetchedTimes(times: number, filter?: InspectionFilter, options?: InspectionOptions): R;
      toBeDone(filter?: InspectionFilter): R;
    }
  }
}


interface FetchMockJest {
  // Reset the call history
  mockClear(): void;
  // Remove all configured mocks
  mockReset(): void;
  // Enable sandbox mode
  sandbox(): jest.MockInstance<Response, MockCall> & FetchMockSandbox;
}

declare const fetchMockJest: FetchMockJest & jest.MockInstance<Response, MockCall> & FetchMockStatic

export = fetchMockJest;
