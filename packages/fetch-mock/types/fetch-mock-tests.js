exports.__esModule = true;
const fetchMock = require('..');
fetchMock.mock();
fetchMock.mock('http://test.com', 200);
fetchMock.mock('http://test.com', 200, {
	headers: {
		test: 'header',
	},
});
fetchMock.mock('http://test.com', 200, {
	body: {
		test: [
			{
				string: 'value',
				number: 1.34,
				bool: true,
			},
		],
	},
});
fetchMock.mock('http//test.com', 200, {
	query: {
		searchValue: 'apples',
	},
});
fetchMock.mock('express:/users/:user', 200, {
	params: {
		user: 'someone',
	},
});
fetchMock.mock('http://test.com', 200, {
	functionMatcher: function (url, opts) {
		return url.includes('test.com');
	},
});
fetchMock.mock('http://test.com', 200, {
	repeat: 2,
});
fetchMock.mock('http://test.com', 200, {
	delay: 10,
});
fetchMock.mock(/test\.com/, 200);
fetchMock.mock(function () {
	return true;
}, 200);
fetchMock.mock(function (url, opts) {
	return true;
}, 200);
fetchMock.once('http://test.com', 200);
fetchMock.mock(/test/, 'test').mock(/test/, { a: 'b' });
fetchMock.mock(/test/, {
	status: 200,
	headers: {
		test: 'test',
	},
	body: {
		a: 'b',
	},
});
fetchMock.mock({
	url: 'http://test.com',
	response: 200,
	headers: {},
	query: {},
	params: {},
	body: {},
	repeat: 1,
	delay: 500,
	functionMatcher: function () {
		return true;
	},
});
fetchMock.mock(
	{
		url: 'http://test.com',
	},
	200,
);
fetchMock.restore().reset().resetHistory().resetBehavior();
let calls = fetchMock.calls(/https?:\/\/test.com/, {
	method: 'GET',
});
calls[0][0].toUpperCase();
calls[0].identifier.toUpperCase();
calls[0].isUnmatched;
calls = fetchMock.calls();
calls = fetchMock.calls(true);
calls = fetchMock.calls('http://test.com', 'GET');
let doneStatus = fetchMock.done();
doneStatus = fetchMock.done(true);
doneStatus = fetchMock.done('http://test.com');
doneStatus = fetchMock.done(/https?:\/\/test.com/);
let calledStatus = fetchMock.called();
calledStatus = fetchMock.called(true);
calledStatus = fetchMock.called('http://test.com');
calledStatus = fetchMock.called(/https?:\/\/test.com/);
calledStatus = fetchMock.called('http://test.com', 'GET');
calledStatus = fetchMock.called('http://test.com', {
	method: 'GET',
});
calledStatus = fetchMock.called(function (url, opts) {
	return true;
});
calledStatus = fetchMock.called(fetchMock.MATCHED);
calledStatus = fetchMock.called(fetchMock.UNMATCHED);
let lastCall = fetchMock.lastCall();
lastCall = fetchMock.lastCall(/https?:\/\/test.com/, {
	method: 'GET',
});
lastCall = fetchMock.lastCall('https://test.com', 'GET');
let lastUrl = fetchMock.lastUrl();
lastUrl = fetchMock.lastUrl(true);
lastUrl = fetchMock.lastUrl('http://test.com');
lastUrl = fetchMock.lastUrl(/https?:\/\/test.com/);
lastUrl = fetchMock.lastUrl('http://test.com', 'GET');
lastUrl = fetchMock.lastUrl('http://test.com', {
	method: 'GET',
});
let lastOptions = fetchMock.lastOptions();
lastOptions = fetchMock.lastOptions(true);
lastOptions = fetchMock.lastOptions('http://test.com');
lastOptions = fetchMock.lastOptions(/https?:\/\/test.com/);
lastOptions = fetchMock.lastOptions('http://test.com', 'GET');
lastOptions = fetchMock.lastOptions('http://test.com', {
	method: 'GET',
});
let lastResponse = fetchMock.lastResponse();
lastResponse = fetchMock.lastResponse(true);
lastResponse = fetchMock.lastResponse('http://test.com');
lastResponse = fetchMock.lastResponse(/https?:\/\/test.com/);
lastResponse = fetchMock.lastResponse('http://test.com', 'GET');
lastResponse = fetchMock.lastResponse('http://test.com', {
	method: 'GET',
});
fetchMock.get('http://test.com', 200);
fetchMock.getOnce('http://test.com', 200);
fetchMock.post('http://test.com', 200);
fetchMock.postOnce('http://test.com', 200);
fetchMock.put('http://test.com', 200);
fetchMock.putOnce('http://test.com', 200);
fetchMock['delete']('http://test.com', 200);
fetchMock.deleteOnce('http://test.com', 200);
fetchMock.head('http://test.com', 200);
fetchMock.headOnce('http://test.com', 200);
fetchMock.patch('http://test.com', 200);
fetchMock.patchOnce('http://test.com', 200);
fetchMock.get('http://test.com', 200, { method: 'GET' });
fetchMock.get('http://test.com', 200, { method: 'GET', overwriteRoutes: true });
fetchMock.get('http://test.com', 200, { overwriteRoutes: true });
fetchMock.post('http://test.com', 200, { method: 'POST' });
fetchMock.put('http://test.com', 200, { method: 'PUT' });
fetchMock['delete']('http://test.com', 200, { method: 'DELETE' });
fetchMock.head('http://test.com', 200, { method: 'HEAD' });
fetchMock.mock('http://test.com', 200)['catch'](503);
fetchMock.mock('http://test.com', 200).spy();
const myMatcher = function (url, opts) {
	return true;
};
fetchMock.flush().then(function (resolved) {
	return resolved.forEach(console.log);
});
fetchMock.flush()['catch'](function (r) {
	return r;
});
fetchMock.flush(true)['catch'](function (r) {
	return r;
});
fetchMock.get('http://test.com', {
	body: 'abc',
	includeContentLength: false,
});
fetchMock.get('http://test.com', {
	body: 'abc',
	redirectUrl: 'http://example.org',
});
const sandbox = fetchMock.sandbox();
sandbox.get('http://test.com', {
	body: 'abc',
	redirectUrl: 'http://example.org',
});
const stickySandbox = fetchMock.sandbox();
stickySandbox.sticky('http://test.com', 200);
stickySandbox.mock('http://test.com', 200, { sticky: true });
const response = {
	throws: new Error('error'),
};
fetchMock.config.sendAsJson = true;
fetchMock.config.includeContentLength = true;
fetchMock.config.fallbackToNetwork = true;
fetchMock.config.fallbackToNetwork = 'always';
fetchMock.config.overwriteRoutes = true;
fetchMock.config.overwriteRoutes = undefined;
fetchMock.config.warnOnFallback = true;
fetchMock.config.fetch = function () {
	return new Promise(function () {});
};
fetchMock.config.Headers = Headers;
fetchMock.config.Request = Request;
fetchMock.config.Response = Response;
