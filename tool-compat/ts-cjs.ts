const fetchMockCore = require("@fetch-mock/core");
fetchMockCore.route("http://example.com", 200);

const fetchMock = require("fetch-mock");
fetchMock.mock("http://example.com", 200);
