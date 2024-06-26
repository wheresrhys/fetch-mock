// /**
//  * Chainable method that records the call history of unmatched calls,
//  * but instead of responding with a stubbed response, the request is
//  * passed through to native fetch() and is allowed to communicate
//  * over the network. Similar to catch().
//  */
// spy(response?: MockResponse | MockResponseFunction): this;

// /**
//  * Restores fetch() to its unstubbed state and clears all data recorded
//  * for its calls. reset() is an alias for restore().
//  */
// restore(): this;

// /**
//  * Restores fetch() to its unstubbed state and clears all data recorded
//  * for its calls. reset() is an alias for restore().
//  */
// reset(): this;

// /**
//  * Clears all data recorded for fetch()’s calls. It will not restore
//  * fetch to its default implementation.
//  */
// resetHistory(): this;

// /**
//  * Removes mocking behaviour without resetting call history.
//  */
// resetBehavior(): this;