const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;

describe('matchPartialBody', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	const postExpect = async (expectedStatus) => {
		const { status } = await fm.fetchHandler('http://a.com', {
			method: 'POST',
			body: JSON.stringify({ a: 1, b: 2 }),
		});
		expect(status).to.equal(expectedStatus);
	};

	it("don't match partial bodies by default", async () => {
		fm.mock({ body: { a: 1 } }, 200).catch(404);
		await postExpect(404);
	});

	it('match partial bodies when configured true', async () => {
		fm.config.matchPartialBody = true;
		fm.mock({ body: { a: 1 } }, 200).catch(404);
		await postExpect(200);
	});

	it('local setting can override to false', async () => {
		fm.config.matchPartialBody = true;
		fm.mock({ body: { a: 1 }, matchPartialBody: false }, 200).catch(404);
		await postExpect(404);
	});

	it('local setting can override to true', async () => {
		fm.config.matchPartialBody = false;
		fm.mock({ body: { a: 1 }, matchPartialBody: true }, 200).catch(404);
		await postExpect(200);
	});
});
