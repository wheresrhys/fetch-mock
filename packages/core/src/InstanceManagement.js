//@type-check
// import setUpAndTearDown from './set-up-and-tear-down.js';
import fetchHandler from './fetch-handler.js';
// import inspecting from './inspecting.js';
// import Route from './Route.js/index.js';

/** @type {FetchMockConfig} */
const defaultConfig  = {
    includeContentLength: true,
    sendAsJson: true,
    warnOnFallback: true,
    Request: globalThis.Request,
    Response: globalThis.Response,
    Headers: globalThis.Headers,
    fetch: globalThis.fetch,
};
/** @type {FetchMock} */
const FetchMock = { 
    // ...fetchHandler, ...setUpAndTearDown, ...inspecting 
};

/** @type {FetchMockConfig} */
FetchMock.config = defaultConfig
/**
 * @returns {FetchMock}
 */
FetchMock.createInstance = function () {
    const instance = Object.create(FetchMock);
    this.fetchHandler = fetchHandler.bind(this);
    instance.router = this.router.clone()
    instance.callHistory = this.callHistory.clone()
    return instance;
};

export default FetchMock.createInstance();