const mocking = require('./mocking');
const inspecting = require('./inspecting');

const FetchMock = Object.assign({}, mocking, inspecting);

FetchMock.config = {
	fallThroughToNetwork: false,
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	fallThroughToNetwork: false
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
	let boundMock;
	const proxy = function () {
		return boundMock.apply(null, arguments);
	}

	const functionInstance = Object.assign(
		proxy, // Ensures that the entire returned object is a callable function
		FetchMock, // all prototype methods
		this.createInstance() // instance data
	);

	functionInstance.bindMethods();
	boundMock = functionInstance.fetchMock;
	functionInstance.isSandbox = true;
	return functionInstance;
};

FetchMock.flush = function () {
	return Promise.all(this._holdingPromises);
}

FetchMock.restore = function () {
	this._unMock();
	this.reset();
	this.routes = [];
	return this;
}

FetchMock.reset = function () {
	this._calls = {};
	this._matchedCalls = [];
	this._unmatchedCalls = [];
	this._holdingPromises = [];
	this.routes.forEach(route => route.reset && route.reset())
	return this;
}

module.exports = FetchMock;
