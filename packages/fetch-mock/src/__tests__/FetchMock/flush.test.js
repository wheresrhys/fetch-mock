import { describe, expect, it, beforeEach } from 'vitest';

import fetchMock from '../../FetchMock';
describe('FetchMockWrapper.js', () => {
	describe('flushing pending calls', () => {
		let fm;
		beforeEach(() => {
			fm = fetchMock.createInstance();
		});

		it('flush resolves if all fetches have resolved', async () => {
			fm.route('http://one.com/', 200).route('http://two.com/', 200);
			// no expectation, but if it doesn't work then the promises will hang
			// or reject and the test will timeout
			await fm.callHistory.flush();
			fm.fetchHandler('http://one.com');
			await fm.callHistory.flush();
			fm.fetchHandler('http://two.com');
			await fm.callHistory.flush();
		});

		it('should resolve after fetches', async () => {
			fm.route('http://example', 'working!');
			let data;
			fm.fetchHandler('http://example').then(() => {
				data = 'done';
			});
			await fm.callHistory.flush();
			expect(data).toEqual('done');
		});

		describe('response methods', () => {
			it('should resolve after .text() if waitForResponseMethods option passed', async () => {
				fm.route('http://example/', 'working!');
				let data = 'not set';
				fm.fetchHandler('http://example/').then(async (res) => {
					await res.text();
					data = 'done';
				});

				await fm.callHistory.flush(true);
				expect(data).toEqual('done');
			});
			it('should resolve after .json() if waitForResponseMethods option passed', async () => {
				fm.route('http://example/', { a: 'ok' });
				let data;
				fm.fetchHandler('http://example/')
					.then((res) => res.json())
					.then(() => {
						data = 'done';
					});

				await fm.callHistory.flush(true);
				expect(data).toEqual('done');
			});

			it('should resolve after .json() if waitForResponseMethods option passed, but contains invalid json', async () => {
				fm.route('http://example/', 'bleurgh');
				let data;
				fm.fetchHandler('http://example/')
					.then((res) => res.json())
					.catch(() => {
						data = 'done';
					});

				await fm.callHistory.flush(true);
				expect(data).toEqual('done');
			});
		});

		it('flush waits for unresolved promises', async () => {
			fm.route('http://one.com/', 200).route(
				'http://two.com/',
				() => new Promise((res) => setTimeout(() => res(200), 50)),
			);

			const orderedResults = [];
			fm.fetchHandler('http://one.com/');
			fm.fetchHandler('http://two.com/');

			setTimeout(() => orderedResults.push('not flush'), 25);

			await fm.callHistory.flush();
			orderedResults.push('flush');
			expect(orderedResults).toEqual(['not flush', 'flush']);
		});

		it('flush resolves on expected error', async () => {
			fm.route('http://one.com/', { throws: 'Problem in space' });
			await fm.callHistory.flush();
		});
	});
});
