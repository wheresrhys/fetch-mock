const {default: fetchMockCore, FetchMock} = require("@fetch-mock/core");
fetchMockCore.route("http://example.com", 200);

new FetchMock({})

const fetchMock = require("fetch-mock").default;
fetchMock.mock("http://example.com", 200);
