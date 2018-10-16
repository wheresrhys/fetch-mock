const chai = require('chai');
const expect = chai.expect;

module.exports = fetchMock => {
	if (typeof AbortController === 'undefined') {
		return;
	}

	describe('abortable fetch', () => {
		let fm;
		beforeEach(() => {
			fm = fetchMock.createInstance();
		});

		it('error on signal abort', async () => {
			fm.mock('http://it.at.there/', () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve();
					}, 500);
				});
			});

			const controller = new AbortController();
			setTimeout(() => controller.abort(), 300);

			try {
				await fm.fetchHandler('http://it.at.there/', {
					signal: controller.signal
				});
			} catch (error) {
				expect(error.message).to.equal("URL 'http://it.at.there/' aborted.");
			}
		});

		it('go into `done` state even when aborted', async () => {
			fm.once('http://it.at.there/', () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve();
					}, 500);
				});
			});

			const controller = new AbortController();
			setTimeout(() => controller.abort(), 300);
			try {
				await fm.fetchHandler('http://it.at.there/', {
					signal: controller.signal
				});
			} catch (error) {
				expect(fm.done()).to.be.true;
			}
		});

		it('will flush even when aborted', async () => {
			fm.mock('http://it.at.there/', () => {
				return new Promise(resolve => {
					setTimeout(() => {
						resolve();
					}, 500);
				});
			});

			const controller = new AbortController();
			setTimeout(() => controller.abort(), 300);

			fm.fetchHandler('http://it.at.there/', { signal: controller.signal });
			await fm.flush();
			expect(fm.done()).to.be.true;
		});
	});
};
