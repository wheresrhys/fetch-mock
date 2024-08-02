import fetchMockCore from "@fetch-mock/core";
fetchMockCore.route("http://example.com", 200);

import fetchMock from "fetch-mock";
fetchMock.mock("http://example.com", 200);
