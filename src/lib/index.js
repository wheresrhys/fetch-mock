const { debug } = require('./debug');
const setUpAndTearDown = require('./set-up-and-tear-down');
const fetchHandler = require('./fetch-handler');
const inspecting = require('./inspecting');
const Route = require('../Route');

const FetchMock = Object.assign({}, fetchHandler, setUpAndTearDown, inspecting);

FetchMock.addMatcher = function (matcher) {
	Route.addMatcher(matcher);
};

FetchMock.config = {
	fallbackToNetwork: false,
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	overwriteRoutes: undefined,
};

FetchMock.createInstance = function () {
	debug('Creating fetch-mock instance');
	const instance = Object.create(FetchMock);
	instance._uncompiledRoutes = (this._uncompiledRoutes || []).slice();
	instance.routes = instance._uncompiledRoutes.map((config) =>
		this.compileRoute(config)
	);
	instance.fallbackResponse = this.fallbackResponse || undefined;
	instance.config = Object.assign({}, this.config || FetchMock.config);
	instance._calls = [];
	instance._holdingPromises = [];
	instance.bindMethods();
	return instance;
};

FetchMock.compileRoute = function (config) {
	return new Route(config, this);
};

FetchMock.bindMethods = function () {
	this.fetchHandler = FetchMock.fetchHandler.bind(this);
	this.reset = this.restore = FetchMock.reset.bind(this);
	this.resetHistory = FetchMock.resetHistory.bind(this);
	this.resetBehavior = FetchMock.resetBehavior.bind(this);
};

FetchMock.sandbox = function () {
	debug('Creating sandboxed fetch-mock instance');
	// this construct allows us to create a fetch-mock instance which is also
	// a callable function, while circumventing circularity when defining the
	// object that this function should be bound to
	const fetchMockProxy = (url, options) => sandbox.fetchHandler(url, options);

	const sandbox = Object.assign(
		fetchMockProxy, // Ensures that the entire returned object is a callable function
		FetchMock, // prototype methods
		this.createInstance(), // instance data
		{
			Headers: this.config.Headers,
			Request: this.config.Request,
			Response: this.config.Response,
		}
	);

	sandbox.bindMethods();
	sandbox.isSandbox = true;
	sandbox.default = sandbox;
	return sandbox;
};

FetchMock.getOption = function (name, route = {}) {
	return name in route ? route[name] : this.config[name];
};

module.exports = FetchMock;
