const chai = require('chai');
const expect = chai.expect;

const { fetchMock } = testGlobals;
describe('options', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});

	describe('fallbackToNetwork', () => {
		it('error by default', () => {
			expect(() => fm.fetchHandler('http://unmocked.com')).to.throw();
		});

		it('not error when configured globally', async () => {
			fm.config.fallbackToNetwork = true;
			fm.mock('http://mocked.com', 201);
			expect(() => fm.fetchHandler('http://unmocked.com')).not.to.throw();
		});

		it('actually falls back to network when configured globally', async () => {
			fm.realFetch = async () => ({ status: 202 });
			fm.config.fallbackToNetwork = true;
			fm.mock('http://mocked.com', 201);
			const res = await fm.fetchHandler('http://unmocked.com');
			expect(res.status).to.equal(202);
		});

		it('actually falls back to network when configured in a sandbox properly', async () => {
			const sbx = fm.sandbox();
			sbx.config.fetch = async () => ({ status: 202 });
			sbx.config.fallbackToNetwork = true;
			sbx.mock('http://mocked.com', 201);
			const res = await sbx('http://unmocked.com');
			expect(res.status).to.equal(202);
		});

		it('calls fetch with original Request object', async () => {
			const sbx = fm.sandbox();
			let calledWith;
			sbx.config.fetch = async (req) => {
				calledWith = req;
				return { status: 202 };
			};
			sbx.config.fallbackToNetwork = true;
			sbx.mock('http://mocked.com', 201);
			const req = new sbx.config.Request('http://unmocked.com');
			await sbx(req);
			expect(calledWith).to.equal(req);
		});

		describe('always', () => {
			it('ignores routes that are matched', async () => {
				fm.realFetch = async () => ({ status: 202 });
				fm.config.fallbackToNetwork = 'always';

				fm.mock('http://mocked.com', 201);
				const res = await fm.fetchHandler('http://unmocked.com');
				expect(res.status).to.equal(202);
			});

			it('ignores routes that are not matched', async () => {
				fm.realFetch = async () => ({ status: 202 });

				fm.config.fallbackToNetwork = 'always';

				fm.mock('http://mocked.com', 201);
				const res = await fm.fetchHandler('http://unmocked.com');
				expect(res.status).to.equal(202);
			});
		});
	});

	describe('includeContentLength', () => {
		it('include content-length header by default', async () => {
			fm.mock('*', 'string');
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-length')).to.equal('6');
		});

		it("don't include when configured false", async () => {
			fm.config.includeContentLength = false;
			fm.mock('*', 'string');
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-length')).not.to.exist;
		});

		it('local setting can override to true', async () => {
			fm.config.includeContentLength = false;
			fm.mock('*', 'string', { includeContentLength: true });
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-length')).to.equal('6');
		});

		it('local setting can override to false', async () => {
			fm.config.includeContentLength = true;
			fm.mock('*', 'string', { includeContentLength: false });
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-length')).not.to.exist;
		});
	});

	describe('sendAsJson', () => {
		it('convert object responses to json by default', async () => {
			fm.mock('*', { an: 'object' });
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-type')).to.equal('application/json');
		});

		it("don't convert when configured false", async () => {
			fm.config.sendAsJson = false;
			fm.mock('*', { an: 'object' });
			const res = await fm.fetchHandler('http://it.at.there');
			// can't check for existence as the spec says, in the browser, that
			// a default value should be set
			expect(res.headers.get('content-type')).not.to.equal('application/json');
		});

		it('local setting can override to true', async () => {
			fm.config.sendAsJson = false;
			fm.mock('*', { an: 'object' }, { sendAsJson: true });
			const res = await fm.fetchHandler('http://it.at.there');
			expect(res.headers.get('content-type')).to.equal('application/json');
		});

		it('local setting can override to false', async () => {
			fm.config.sendAsJson = true;
			fm.mock('*', { an: 'object' }, { sendAsJson: false });
			const res = await fm.fetchHandler('http://it.at.there');
			// can't check for existence as the spec says, in the browser, that
			// a default value should be set
			expect(res.headers.get('content-type')).not.to.equal('application/json');
		});
	});

	describe('matchPartialBody', () => {
		it("don't match partial bodies by default", async () => {
			fm.mock({ body: { ham: 'sandwich' } }, 200).catch(404);
			const res = await fm.fetchHandler('http://it.at.there', {
				method: 'POST',
				body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
			});
			expect(res.status).to.equal(404);
		});

		it('match partial bodies when configured true', async () => {
			fm.config.matchPartialBody = true;
			fm.mock({ body: { ham: 'sandwich' } }, 200).catch(404);
			const res = await fm.fetchHandler('http://it.at.there', {
				method: 'POST',
				body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
			});
			expect(res.status).to.equal(200);
			fm.config.matchPartialBody = false;
		});

		it('local setting can override to false', async () => {
			fm.config.matchPartialBody = true;
			fm.mock(
				{ body: { ham: 'sandwich' }, matchPartialBody: false },
				200
			).catch(404);
			const res = await fm.fetchHandler('http://it.at.there', {
				method: 'POST',
				body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
			});
			expect(res.status).to.equal(404);
			fm.config.matchPartialBody = false;
		});

		it('local setting can override to true', async () => {
			fm.config.matchPartialBody = false;
			fm.mock({ body: { ham: 'sandwich' }, matchPartialBody: true }, 200).catch(
				404
			);
			const res = await fm.fetchHandler('http://it.at.there', {
				method: 'POST',
				body: JSON.stringify({ ham: 'sandwich', egg: 'mayonaise' }),
			});
			expect(res.status).to.equal(200);
		});
	});

	describe.skip('warnOnFallback', () => {
		it('warn on fallback response by default', async () => {});
		it("don't warn on fallback response when configured false", async () => {});
	});

	describe('overwriteRoutes', () => {
		it('error on duplicate routes by default', async () => {
			expect(() =>
				fm.mock('http://a.com', 200).mock('http://a.com', 300)
			).to.throw();
		});

		it('allow overwriting existing route', async () => {
			fm.config.overwriteRoutes = true;
			expect(() =>
				fm.mock('http://a.com', 200).mock('http://a.com', 300)
			).not.to.throw();

			const res = await fm.fetchHandler('http://a.com');
			expect(res.status).to.equal(300);
		});

		it('allow adding additional routes with same matcher', async () => {
			fm.config.overwriteRoutes = false;
			expect(() =>
				fm.mock('http://a.com', 200, { repeat: 1 }).mock('http://a.com', 300)
			).not.to.throw();

			const res = await fm.fetchHandler('http://a.com');
			expect(res.status).to.equal(200);
			const res2 = await fm.fetchHandler('http://a.com');
			expect(res2.status).to.equal(300);
		});
	});
});
