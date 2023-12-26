import { afterEach, describe, expect, it, vi } from 'vitest';
import { Readable, Writable } from 'stream';
const { fetchMock } = testGlobals;
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
		// only works in node-fetch@2
		it.skip('can respond with a readable stream', () =>
			new Promise((res) => {
				const readable = new Readable();
				const write = vi.fn().mockImplementation((chunk, enc, cb) => {
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
					res();
				});
			}));

		// See https://github.com/wheresrhys/fetch-mock/issues/575
		it('can respond with large bodies from the interweb', async () => {
			const fm = fetchMock.sandbox();
			fm.config.fallbackToNetwork = true;
			fm.mock();
			// this is an adequate test because the response hangs if the
			// bug referenced above creeps back in
			await fm
				.fetchHandler('http://www.wheresrhys.co.uk/assets/img/chaffinch.jpg')
				.then((res) => res.blob());
		});
	});
});
