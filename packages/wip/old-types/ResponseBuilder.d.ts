
/**
 * Mock response object
 */
interface MockResponseObject {
    /**
     * Set the response body
     */
    body?: string | {};

    /**
     * Set the response status
     * @default 200
     */
    status?: number;

    /**
     * Set the response headers.
     */
    headers?: { [key: string]: string };

    /**
     * If this property is present then a Promise rejected with the value
     * of throws is returned
     */
    throws?: Error;

    /**
     * The URL the response should be from (to imitate followed redirects
     *  - will set redirected: true on the response)
     */
    redirectUrl?: string;
}

/**
 * Response: A Response instance - will be used unaltered
 * number: Creates a response with this status
 * string: Creates a 200 response with the string as the response body
 * object: As long as the object is not a MockResponseObject it is
 *  converted into a json string and returned as the body of a 200 response
 * If MockResponseObject was given then it's used to configure response
 * Function(url, opts): A function that is passed the url and opts fetch()
 *  is called with and that returns any of the responses listed above
 */
type MockResponse = Response | Promise<Response>
    | number | Promise<number>
    | string | Promise<string>
    | {} | Promise<{}>
    | MockResponseObject | Promise<MockResponseObject>;

/**
 * Mock response function
 */
type MockResponseFunction = (url: string, opts: MockRequest) => MockResponse;
