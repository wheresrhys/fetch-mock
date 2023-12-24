import Stream from 'stream';
import http from 'http';
import { URL } from 'node:url';
import FetchMock from './lib/index';
import { setUrlImplementation } from './lib/request-utils';
import {
  // isRedirect,
  // Promise,
  default as fetch,
  Headers,
  Request,
  Response,
  // FetchError,
  // AbortError
} from 'node-fetch'

setUrlImplementation(URL);

FetchMock.global = global;
FetchMock.statusTextMap = http.STATUS_CODES;
FetchMock.Stream = Stream;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise,
	Request,
	Response,
	Headers,
	fetch,
});

export default FetchMock.createInstance();
