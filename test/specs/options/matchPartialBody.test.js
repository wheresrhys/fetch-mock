const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;

describe('matchPartialBody', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	const mock = (options) =>
		fm.mock({ body: { ham: 'sandwich' }, ...options }, 200).catch(404);

	const postExpect = async (expectedStatus) => {
		const { status } = await fm.fetchHandler('http://a.com', {
			method: 'POST',
			body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
		});
		expect(status).to.equal(expectedStatus);
	};

	it("don't match partial bodies by default", async () => {
		mock();
		await postExpect(404);
	});

	it('match partial bodies when configured true', async () => {
		fm.config.matchPartialBody = true;
		mock();
		await postExpect(200);
	});

	it('local setting can override to false', async () => {
		fm.config.matchPartialBody = true;
		mock({ matchPartialBody: false });
		await postExpect(404);
	});

	it('local setting can override to true', async () => {
		fm.config.matchPartialBody = false;
		mock({ matchPartialBody: true });
		await postExpect(200);
	});
});
