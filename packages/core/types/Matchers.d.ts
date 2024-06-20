

/**
 * Mock matcher function
 */
type RouteMatcherUrl = string | RegExp | URL;




/**
 * Mock matcher. Can be one of following:
 * string: Either
 *   * an exact url to match e.g. 'http://www.site.com/page.html'
 *   * if the string begins with a `^`, the string following the `^` must
 *     begin the url e.g. '^http://www.site.com' would match
 *      'http://www.site.com' or 'http://www.site.com/page.html'
 *    * '*' to match any url
 * RegExp: A regular expression to test the url against
 * Function(url, opts): A function (returning a Boolean) that is passed the
 *  url and opts fetch() is called with (or, if fetch() was called with one,
 *  the Request instance)
 */
type RouteMatcher = RouteMatcherUrl | RouteMatcherFunction;


type UrlMatcher = (url: string) => boolean;

type UrlMatcherGenerator = (pattern: string) => UrlMatcher;

type RouteMatcherFunction = (url: string, opts: MockRequest, request: Request) => boolean;

type MatcherGenerator = (route: RouteOptions) => RouteMatcherFunction;

type MatcherDefinition = {
    name: string;
    matcher: MatcherGenerator;
    usesBody?: boolean;
}