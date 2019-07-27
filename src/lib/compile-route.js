const debug = require('debug')('fetch-mock')
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

const sanitizeRoute = (route, useDebugger = true) => {
	useDebugger && debug('Sanitizing route properties');
	route = Object.assign({}, route);

	if (route.method) {
		useDebugger && debug(`Converting method ${route.method} to lower case`);
		route.method = route.method.toLowerCase();
	}
	if (isUrlMatcher(route.matcher)) {
		route.url = route.matcher;
		delete route.matcher;
	}

	route.functionMatcher = route.matcher || route.functionMatcher;

	useDebugger && debug('Setting route.identifier...')
	useDebugger && debug(`  route.name is ${route.name}`)
	useDebugger && debug(`  route.matcher is ${route.matcher}`)
	route.identifier = route.name || route.url || route.functionMatcher;
	useDebugger && debug(`  > route.identifier set to ${route.identifier}`);
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
	debug('Limiting number of requests to handle by route');
	if (!route.repeat) {
		debug('No `repeat` value set on route. Will match any number of requests')
		return;
	}

	debug(`Route set to repeat ${route.repeat} times`)
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
	debug('Compiling route');
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
