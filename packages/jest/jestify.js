/*global jest*/
require('./jest-extensions');

const jestify = (fetchMockInstance) => {
	const jestifiedInstance = new Proxy(fetchMockInstance, {
		get: (originalFetchMock, name) => {
			if (name === 'sandbox') {
				return new Proxy(originalFetchMock[name], {
					apply: (func, thisArg, args) => {
						const sandboxedFetchMock = func.apply(originalFetchMock, args);
						return jestify(sandboxedFetchMock);
					},
				});
			}
			return originalFetchMock[name];
		},
	});

	// spy on the fetch handler so we can use all the
	// jest function assertions on it
	const spy = jest.fn();
	const originalFetchHandler = jestifiedInstance.fetchHandler.bind(
		jestifiedInstance
	);

	jestifiedInstance.fetchHandler = function (...args) {
		const result = originalFetchHandler(...args);
		spy.mockReturnValueOnce(result);
		spy.apply(this, args);
		return result;
	};

	// make sure all the jest expectation helpers can find what they need on fetchMock.mock
	Object.assign(jestifiedInstance.mock, spy.mock);

	['_isMockFunction', 'mockName', 'getMockName'].forEach((prop) => {
		jestifiedInstance[prop] = spy[prop];
	});

	jestifiedInstance.mockClear = () => {
		spy.mockClear();
		jestifiedInstance.resetHistory();
		Object.assign(jestifiedInstance.mock, spy.mock);
	};
	jestifiedInstance.mockReset = () => {
		spy.mockReset();
		jestifiedInstance.reset();
		Object.assign(jestifiedInstance.mock, spy.mock);
	};
	jestifiedInstance.mockRestore = () => {
		throw new Error(
			"mockRestore not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockImplementation = () => {
		throw new Error(
			"mockImplementation not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockImplementationOnce = () => {
		throw new Error(
			"mockImplementationOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockName = () => {
		throw new Error(
			"mockName not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockReturnThis = () => {
		throw new Error(
			"mockReturnThis not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockReturnValue = () => {
		throw new Error(
			"mockReturnValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockReturnValueOnce = () => {
		throw new Error(
			"mockReturnValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockResolvedValue = () => {
		throw new Error(
			"mockResolvedValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockResolvedValueOnce = () => {
		throw new Error(
			"mockResolvedValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockRejectedValue = () => {
		throw new Error(
			"mockRejectedValue not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};
	jestifiedInstance.mockRejectedValueOnce = () => {
		throw new Error(
			"mockRejectedValueOnce not supported on fetch-mock. Use fetch-mock's methods to manage mock responses"
		);
	};

	// make sure that the mock object that has properties updated
	// by the jest spy is the one that is exposed on fetch
	spy.mock = jestifiedInstance.mock;

	// Return this monster!
	return jestifiedInstance;
};

module.exports = (fetchMock) => jestify(fetchMock);
