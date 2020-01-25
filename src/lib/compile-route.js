const { getDebug } = require('./debug');
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
	const debug = getDebug('sanitizeRoute()');
	debug('Sanitizing route properties');
	route = Object.assign({}, route);

	if (route.method) {
		debug(`Converting method ${route.method} to lower case`);
		route.method = route.method.toLowerCase();
	}
	if (isUrlMatcher(route.matcher)) {
		debug('Mock uses a url matcher', route.matcher);
		route.url = route.matcher;
		delete route.matcher;
	}

	route.functionMatcher = route.matcher || route.functionMatcher;

	debug('Setting route.identifier...');
	debug(`  route.name is ${route.name}`);
	debug(`  route.url is ${route.url}`);
	debug(`  route.functionMatcher is ${route.functionMatcher}`);
	route.identifier = route.name || route.url || route.functionMatcher;
	debug(`  -> route.identifier set to ${route.identifier}`);
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

const limit = route => {
	const debug = getDebug('limit()');
	debug('Limiting number of requests to handle by route');
	if (!route.repeat) {
		debug(
			'  No `repeat` value set on route. Will match any number of requests'
		);
		return;
	}

	debug(`  Route set to repeat ${route.repeat} times`);
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
	const debug = getDebug('delayResponse()');
	debug(`Applying response delay settings`);
	const { delay } = route;
	if (delay) {
		debug(`  Wrapping response in delay of ${delay} miliseconds`);
		const response = route.response;
		route.response = () => {
			debug(`Delaying response by ${delay} miliseconds`);
			return new Promise(res => setTimeout(() => res(response), delay));
		};
	} else {
		debug(
			`  No delay set on route. Will respond 'immediately' (but asynchronously)`
		);
	}
};

const compileRoute = function(args) {
	const debug = getDebug('compileRoute()');
	debug('Compiling route');
	const route = sanitizeRoute(argsToRoute(args));
	validateRoute(route);
	route.matcher = generateMatcher(route);
	limit(route);
	delayResponse(route);
	return route;
};

module.exports = {
	compileRoute,
	sanitizeRoute
};
