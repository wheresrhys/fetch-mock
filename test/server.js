const fetchMock = require('../src/server.js');
const expect = require('chai').expect;
const http = require('http');
const sinon = require('sinon');
const { promisify } = require('util');

describe('nodejs tests', () => {
	let server;
	before(() => {
		server = http.createServer((req, res) => {
			res.writeHead(200);
			res.end();
		});

		return promisify(server.listen.bind(server))(9876);
	});
	after(() => {
		server.close();
	});

	require('./runner')(
		fetchMock,
		global,
		require('node-fetch'),
		require('abort-controller')
	);

	describe('support for nodejs body types', () => {
		afterEach(() => fetchMock.reset());
		it('can respond with a buffer', () => {
			fetchMock.mock(/a/, new Buffer('buffer'), { sendAsJson: false });
			return fetchMock
				.fetchHandler('http://a.com')
				.then(res => res.text())
				.then(txt => {
					expect(txt).to.equal('buffer');
				});
		});

		it('can respond with a readable stream', done => {
			const { Readable, Writable } = require('stream');
			const readable = new Readable();
			const write = sinon.stub().callsFake((chunk, enc, cb) => {
				cb();
			});
			const writable = new Writable({
				write
			});
			readable.push('response string');
			readable.push(null);

			fetchMock.mock(/a/, readable, { sendAsJson: false });
			fetchMock.fetchHandler('http://a.com').then(res => {
				res.body.pipe(writable);
			});

			writable.on('finish', () => {
				expect(write.args[0][0].toString('utf8')).to.equal('response string');
				done();
			});
		});
	});
});
