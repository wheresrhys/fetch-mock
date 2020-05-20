const { expect } = require('chai');

const RESPONSE_DELAY = 10;
const ABORT_DELAY = 5;

const { fetchMock, AbortController } = testGlobals;
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
		try {
			await fm.fetchHandler(...fetchArgs);
			throw new Error('unexpected');
		} catch (error) {
			if (typeof DOMException !== 'undefined') {
				expect(error instanceof DOMException).to.equal(true);
			}
			expect(error.name).to.equal('AbortError');
			expect(error.message).to.equal('The operation was aborted.');
		}
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

	const isNodeFetch1 = /^1/.test(require('node-fetch/package.json').version);

	// node-fetch 1 does not support abort signals at all, so when passing
	// a signal into the Request constructor it just gets ignored. So use of
	// signals in this way is both unimplementable and untestable in node-fetch@1
	(isNodeFetch1 ? it.skip : it)(
		'error on signal abort for request object',
		() => {
			fm.mock('*', getDelayedOk());
			return expectAbortError(
				new fm.config.Request('http://a.com', {
					signal: getDelayedAbortController().signal,
				})
			);
		}
	);

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
		expect(fm.done()).to.be.true;
	});

	it('will flush even when aborted', async () => {
		fm.mock('http://a.com', getDelayedOk());

		await expectAbortError('http://a.com', {
			signal: getDelayedAbortController().signal,
		});
		await fm.flush();
		expect(fm.done()).to.be.true;
	});
});
