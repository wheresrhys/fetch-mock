import builtInMatchers from './matchers.js';

const isUrlMatcher = (matcher) =>
	matcher instanceof RegExp ||
	typeof matcher === 'string' ||
	(typeof matcher === 'object' && 'href' in matcher);

const isFunctionMatcher = (matcher) => typeof matcher === 'function';

const nameToOptions = (options) =>
	typeof options === 'string' ? { name: options } : options;

class Route {
	constructor(args, fetchMock) {
		this.fetchMock = fetchMock;
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
				"fetch-mock: Each route must specify some criteria for matching calls to fetch. To match all calls use '*'",
			);
		}
	}

	init(args) {
		const [matcher, response, nameOrOptions = {}] = args;
		const routeConfig = {};

		if (isUrlMatcher(matcher) || isFunctionMatcher(matcher)) {
			routeConfig.matcher = matcher;
		} else {
			Object.assign(routeConfig, matcher);
		}

		if (typeof response !== 'undefined') {
			routeConfig.response = response;
		}

		if (nameOrOptions) {
			Object.assign(
				routeConfig,
				typeof nameOrOptions === 'string'
					? nameToOptions(nameOrOptions)
					: nameOrOptions,
			);
		}

		Object.assign(this, routeConfig);
	}

	sanitize() {
		if (this.method) {
			this.method = this.method.toLowerCase();
		}
		if (isUrlMatcher(this.matcher)) {
			this.url = this.matcher;
			delete this.matcher;
		}

		this.functionMatcher = this.matcher || this.functionMatcher;

		this.identifier = this.name || this.url || this.functionMatcher;
	}

	generateMatcher() {
		const activeMatchers = Route.registeredMatchers
			.map(
				({ name, matcher, usesBody }) =>
					this[name] && { matcher: matcher(this, this.fetchMock), usesBody },
			)
			.filter((matcher) => Boolean(matcher));

		this.usesBody = activeMatchers.some(({ usesBody }) => usesBody);

		this.matcher = (url, options = {}, request) =>
			activeMatchers.every(({ matcher }) => matcher(url, options, request));
	}

	limit() {
		if (!this.repeat) {
			return;
		}

		const { matcher } = this;
		let timesLeft = this.repeat;
		this.matcher = (url, options) => {
			const match = timesLeft && matcher(url, options);
			if (match) {
				timesLeft--;
				return true;
			}
		};
		this.reset = () => {
			timesLeft = this.repeat;
		};
	}

	delayResponse() {
		if (this.delay) {
			const { response } = this;
			this.response = () => {
				return new Promise((res) =>
					setTimeout(() => res(response), this.delay),
				);
			};
		}
	}

	static addMatcher(matcher) {
		Route.registeredMatchers.push(matcher);
	}
}

Route.registeredMatchers = [];

builtInMatchers.forEach(Route.addMatcher);

export default Route;
