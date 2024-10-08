import { beforeEach, describe, expect, it } from 'vitest';

const RESPONSE_DELAY = 50;
const ABORT_DELAY = 10;

import fetchMock from '../../src/index.js';
const getDelayedOk = () =>
	new Promise((res) => setTimeout(() => res(200), RESPONSE_DELAY));

const getDelayedAbortController = () => {
	const controller = new AbortController();
	setTimeout(() => controller.abort(), ABORT_DELAY);
	return controller;
};

describe('abortable fetch', () => {
	let fm;

	const expectAbortError = async (...fetchArgs) => {
		const result = fm.fetchHandler(...fetchArgs);
		await expect(result).rejects.toThrowError(
			new DOMException('The operation was aborted.', 'ABortError'),
		);
	};

	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	it('error on signal abort', () => {
		fm.mock('*', getDelayedOk());
		return expectAbortError('http://a.com', {
			signal: getDelayedAbortController().signal,
		});
	});

	it('error on signal abort for request object', () => {
		fm.mock('*', getDelayedOk());
		return expectAbortError(
			new fm.config.Request('http://a.com', {
				signal: getDelayedAbortController().signal,
			}),
		);
	});

	it('error when signal already aborted', () => {
		fm.mock('*', 200);
		const controller = new AbortController();
		controller.abort();
		return expectAbortError('http://a.com', {
			signal: controller.signal,
		});
	});

	it('go into `done` state even when aborted', async () => {
		fm.once('http://a.com', getDelayedOk());
		await expectAbortError('http://a.com', {
			signal: getDelayedAbortController().signal,
		});
		expect(fm.done()).toBe(true);
	});

	it('will flush even when aborted', async () => {
		fm.mock('http://a.com', getDelayedOk());

		await expectAbortError('http://a.com', {
			signal: getDelayedAbortController().signal,
		});
		await fm.flush();
		expect(fm.done()).toBe(true);
	});
});
