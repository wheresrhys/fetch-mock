const generateMatcher = require('./generate-matcher');

const matcherProperties = [
	'query',
	'method',
	'headers',
	'params',
	'body',
	'functionMatcher',
	'url'
];

const isUrlMatcher = matcher =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);
const isFunctionMatcher = matcher => typeof matcher === 'function';

const argsToRoute = args => {
	const [matcher, response, options = {}] = args;

	const routeConfig = {};

	if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
		routeConfig.matcher = matcher;
	} else {
		Object.assign(routeConfig, matcher);
	}

	if (response) {
		routeConfig.response = response;
	}

	Object.assign(routeConfig, options);
	return routeConfig;
};

const sanitizeRoute = route => {
	route = Object.assign({}, route);

	if (route.method) {
		route.method = route.method.toLowerCase();
	}
	if (isUrlMatcher(route.matcher)) {
		route.url = route.matcher;
		delete route.matcher;
	}

	route.functionMatcher = route.matcher || route.functionMatcher;

	route.identifier = route.name || route.url || route.functionMatcher;
	return route;
};

const validateRoute = route => {
	if (!('response' in route)) {
		throw new Error('fetch-mock: Each route must define a response');
	}

	if (!matcherProperties.some(matcherType => matcherType in route)) {
		throw new Error(
			"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'"
		);
	}
};

const limitMatcher = route => {
	if (!route.repeat) {
		return;
	}

	const matcher = route.matcher;
	let timesLeft = route.repeat;
	route.matcher = (url, options) => {
		const match = timesLeft && matcher(url, options);
		if (match) {
			timesLeft--;
			return true;
		}
	};
	route.reset = () => (timesLeft = route.repeat);
};

const delayResponse = route => {
	const { delay } = route;
	if (delay) {
		const response = route.response;
		route.response = () =>
			new Promise(res => setTimeout(() => res(response), delay));
	}
};

const compileRoute = function(args) {
	const route = sanitizeRoute(argsToRoute(args));
	validateRoute(route);
	route.matcher = generateMatcher(route);
	limitMatcher(route);
	delayResponse(route);
	return route;
};

module.exports = {
	compileRoute,
	sanitizeRoute
};
