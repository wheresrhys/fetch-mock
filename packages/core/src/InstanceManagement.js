//@type-check
// import setUpAndTearDown from './set-up-and-tear-down.js';
// import fetchHandler from './fetch-handler.js';
// import inspecting from './inspecting.js';
// import Route from './Route.js/index.js';

/** @type {} */
const defaultConfig  = {
    includeContentLength: true,
    sendAsJson: true,
    warnOnFallback: true,
    Request: globalThis.Request,
    Response: globalThis.Response,
    Headers: globalThis.Headers,
    fetch: globalThis.fetch,
};

const FetchMock = { ...fetchHandler, ...setUpAndTearDown, ...inspecting };

FetchMock.config = defaultConfig

FetchMock.createInstance = function () {
    const instance = Object.create(FetchMock);
    this.fetchHandler = FetchMock.fetchHandler.bind(this);
    instance.router = this.router.clone()
    instance.callHistory = this.callHistory.clone()
    return instance;

    // const instance = Object.create(FetchMock);
    // instance._uncompiledRoutes = (this._uncompiledRoutes || []).slice();
    // instance.routes = instance._uncompiledRoutes.map((config) =>
    //     this.compileRoute(config),
    // );
    // instance.fallbackResponse = this.fallbackResponse || undefined;
    // instance.config = { ...(this.config || FetchMock.config) };
    // instance._calls = [];
    // instance._holdingPromises = [];
    // instance.bindMethods();
    // return instance;
};

FetchMock.flush = async function (waitForResponseMethods) {
    const queuedPromises = this._holdingPromises;
    this._holdingPromises = [];

    await Promise.all(queuedPromises);
    if (waitForResponseMethods && this._holdingPromises.length) {
        await this.flush(waitForResponseMethods);
    }
};

export default FetchMock.createInstance();