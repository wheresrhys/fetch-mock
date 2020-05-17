const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

const {fetchMock} = testGlobals;
	describe('nodejs only tests', () => {
		describe('support for nodejs body types', () => {
			afterEach(() => fetchMock.reset());

			it('can respond with a buffer', () => {
				fetchMock.mock(/a/, new Buffer('buffer'), { sendAsJson: false });
				return fetchMock
					.fetchHandler('http://a.com')
					.then((res) => res.text())
					.then((txt) => {
						expect(txt).to.equal('buffer');
					});
			});

			it('can respond with a readable stream', (done) => {
				const { Readable, Writable } = require('stream');
				const readable = new Readable();
				const write = sinon.stub().callsFake((chunk, enc, cb) => {
					cb();
				});
				const writable = new Writable({
					write,
				});
				readable.push('response string');
				readable.push(null);

				fetchMock.mock(/a/, readable, { sendAsJson: false });
				fetchMock.fetchHandler('http://a.com').then((res) => {
					res.body.pipe(writable);
				});

				writable.on('finish', () => {
					expect(write.args[0][0].toString('utf8')).to.equal('response string');
					done();
				});
			});
		});
	});
