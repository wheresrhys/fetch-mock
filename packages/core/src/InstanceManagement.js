//@type-check
import fetchHandler from './FetchHandler.js';
// import inspecting from './inspecting.js';

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
const FetchMock = { 
    // ...fetchHandler, ...setUpAndTearDown, ...inspecting
    config: defaultConfig ,
    createInstance () {
        const instance = Object.create(FetchMock);
        this.fetchHandler = fetchHandler.bind(this);
        instance.router = this.router.clone()
        instance.callHistory = this.callHistory.clone()
        return instance;
    }
};

export default FetchMock.createInstance();