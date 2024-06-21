type RequestConstructor = new (input: string | Request, init ?: RequestInit) => Request;

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
    Request?: RequestConstructor;

    /**
     * Reference to the Response constructor of a custom fetch
     * implementation.
     */
    Response?: new () => Response;
}

declare type FetchMockCore ={
    createInstance: () => FetchMock
    config: FetchMockConfig;
}

declare type FetchMock = FetchMockCore & Router

// 5. Declaration merging
// Unlike a type alias, an interface can be defined multiple times, and will be treated as a single interface(with members of all declarations being merged).

// // These two declarations become:
// // interface Point { x: number; y: number; }
// interface Point { x: number; }
// interface Point { y: number; }

// const point: Point = { x: 1, y: 2 };