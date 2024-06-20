declare interface FetchMockConfig {

    /**
     * Convert objects into JSON before delivering as stub responses.
     * Can be useful to set to false globally if e.g. dealing with a
     * lot of array buffers. If true, will also add
     * content-type: application/json header.
     * @default true
     */
    sendAsJson?: boolean;

    /**
     * Automatically sets a content-length header on each response.
     * @default true
     */
    includeContentLength?: boolean;

    /**
     * Print a warning if any call is caught by a fallback handler (set
     * using the fallbackToNetwork option or catch())
     * @default true
     */
    warnOnFallback?: boolean;

    /**
     * Reference to a custom fetch implementation.
     */
    fetch?: (
        input?: string | Request,
        init?: RequestInit,
    ) => Promise<Response>;

    /**
     * Reference to the Headers constructor of a custom fetch
     * implementation.
     */
    Headers?: new () => Headers;

    /**
     * Reference to the Request constructor of a custom fetch
     * implementation.
     */
    Request?: new (input: string | Request, init?: RequestInit) => Request;

    /**
     * Reference to the Response constructor of a custom fetch
     * implementation.
     */
    Response?: new () => Response;
}

declare interface FetchMockInstance {

    // MATCHED: true;
    // UNMATCHED: false;



    // /**
    //  * Returns a promise that resolves once all fetches handled by fetch-mock
    //  * have resolved.
    //  * @param [waitForBody] Wait for all body parsing methods(res.json(),
    //  * res.text(), etc.) to resolve too.
    //  */
    // flush(waitForBody?: boolean): Promise<MockResponse[]>;
    config: FetchMockConfig;
}