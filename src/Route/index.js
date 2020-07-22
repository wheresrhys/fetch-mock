const builtInMatchers = require('./matchers');

const { debug, setDebugNamespace, getDebug } = require('../lib/debug');

const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

const isFunctionMatcher = (matcher) => typeof matcher === 'function';

class Route {
	constructor(args, fetchMock) {
		this.fetchMock = fetchMock;
		const debug = getDebug('compileRoute()');
		debug('Compiling route');
		this.init(args);
		this.sanitize();
		this.validate();
		this.generateMatcher();
		this.limit();
		this.delayResponse();
	}

	validate() {
		if (!('response' in this)) {
			throw new Error('fetch-mock: Each route must define a response');
		}

		if (!Route.registeredMatchers.some(({ name }) => name in this)) {
			throw new Error(
				"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'"
			);
		}
	}

	init(args) {
		const [matcher, response, options = {}] = args;

		const routeConfig = {};

		if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
			routeConfig.matcher = matcher;
		} else {
			Object.assign(routeConfig, matcher);
		}

		if (typeof response !== 'undefined') {
			routeConfig.response = response;
		}

		Object.assign(routeConfig, options);
		Object.assign(this, routeConfig);
	}

	sanitize() {
		const debug = getDebug('sanitize()');
		debug('Sanitizing route properties');

		if (this.method) {
			debug(`Converting method ${this.method} to lower case`);
			this.method = this.method.toLowerCase();
		}
		if (isUrlMatcher(this.matcher)) {
			debug('Mock uses a url matcher', this.matcher);
			this.url = this.matcher;
			delete this.matcher;
		}

		this.functionMatcher = this.matcher || this.functionMatcher;

		debug('Setting route.identifier...');
		debug(`  route.name is ${this.name}`);
		debug(`  route.url is ${this.url}`);
		debug(`  route.functionMatcher is ${this.functionMatcher}`);
		this.identifier = this.name || this.url || this.functionMatcher;
		debug(`  -> route.identifier set to ${this.identifier}`);
	}

	generateMatcher() {
		setDebugNamespace('generateMatcher()');
		debug('Compiling matcher for route');

		const activeMatchers = Route.registeredMatchers
			.map(
				({ name, matcher, usesBody }) =>
					this[name] && { matcher: matcher(this, this.fetchMock), usesBody }
			)
			.filter((matcher) => Boolean(matcher));

		this.usesBody = activeMatchers.some(({ usesBody }) => usesBody);

		debug('Compiled matcher for route');
		setDebugNamespace();
		this.matcher = (url, options = {}, request) =>
			activeMatchers.every(({ matcher }) => matcher(url, options, request));
	}

	limit() {
		const debug = getDebug('limit()');
		debug('Limiting number of requests to handle by route');
		if (!this.repeat) {
			debug(
				'  No `repeat` value set on route. Will match any number of requests'
			);
			return;
		}

		debug(`  Route set to repeat ${this.repeat} times`);
		const matcher = this.matcher;
		let timesLeft = this.repeat;
		this.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => (timesLeft = this.repeat);
	}

	delayResponse() {
		const debug = getDebug('delayResponse()');
		debug(`Applying response delay settings`);
		if (this.delay) {
			debug(`  Wrapping response in delay of ${this.delay} miliseconds`);
			const response = this.response;
			this.response = () => {
				debug(`Delaying response by ${this.delay} miliseconds`);
				return new Promise((res) =>
					setTimeout(() => res(response), this.delay)
				);
			};
		} else {
			debug(
				`  No delay set on route. Will respond 'immediately' (but asynchronously)`
			);
		}
	}

	static addMatcher(matcher) {
		Route.registeredMatchers.push(matcher);
	}
}

Route.registeredMatchers = [];

builtInMatchers.forEach(Route.addMatcher);

module.exports = Route;
