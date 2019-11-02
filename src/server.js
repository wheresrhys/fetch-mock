import fetch from 'node-fetch';
const Request = fetch.Request;
const Response = fetch.Response;
const Headers = fetch.Headers;
import Stream from 'stream';
import FetchMock from './lib/index';
import http from 'http';
import {  setUrlImplementation  } from './lib/request-utils';
import {URL} from 'whatwg-url'
setUrlImplementation(URL);

FetchMock.global = global;
FetchMock.statusTextMap = http.STATUS_CODES;
FetchMock.Stream = Stream;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise: Promise,
	Request: Request,
	Response: Response,
	Headers: Headers
});

export default FetchMock.createInstance();
