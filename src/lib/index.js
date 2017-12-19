const setUpAndTearDown = require('./set-up-and-tear-down');
const fetchHandler = require('./fetch-handler');
const inspecting = require('./inspecting');

const FetchMock = Object.assign({}, fetchHandler, setUpAndTearDown, inspecting);

FetchMock.config = {
	fallThroughToNetwork: false,
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	overwriteRoutes: undefined
}

FetchMock.createInstance = function () {
	const instance = Object.create(FetchMock);
	instance.routes = [];
	instance.config = Object.assign({}, this.config || FetchMock.config);
	instance._calls = {};
	instance._matchedCalls = [];
	instance._unmatchedCalls = [];
	instance._holdingPromises = [];
	instance.bindMethods();
	return instance;
}

FetchMock.bindMethods = function () {
	this.fetchMock = FetchMock.fetchMock.bind(this);
	this.restore = FetchMock.restore.bind(this);
	this.reset = FetchMock.reset.bind(this);
}

FetchMock.sandbox = function () {
	if (this.routes.length || this.fallbackResponse) {
		throw new Error('.sandbox() can only be called on fetch-mock instances that don\'t have routes configured already')
	}
	// this construct allows us to create a fetch-mock instance which is also
	// a callable function, while circumventing circularity when defining the
	// object that this function should be bound to
	let mock;
	const proxy = function () {
		return mock.apply(null, arguments);
	}

	const sandbox = Object.assign(
		proxy, // Ensures that the entire returned object is a callable function
		FetchMock, // all prototype methods
		this.createInstance() // instance data
	);

	sandbox.bindMethods();
	mock = sandbox.fetchMock;
	sandbox.isSandbox = true;
	return sandbox;
};

module.exports = FetchMock;
