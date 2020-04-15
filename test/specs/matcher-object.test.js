const chai = require('chai');
const expect = chai.expect;

module.exports = (fetchMock) => {
	describe('matcher object', () => {
		let fm;
		beforeEach(() => {
			fm = fetchMock.createInstance();
		});

		it('use matcher object with matcher property', async () => {
			fm.mock({ matcher: 'http://it.at.there/path' }, 200).catch();
			await fm.fetchHandler('http://it.at.there/path');
			expect(fm.calls(true).length).to.equal(1);
			await fm.fetchHandler('http://it.at.there/path/abouts');
			await fm.fetchHandler('http://it.at.the');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('use matcher object with url property', async () => {
			fm.mock({ url: 'http://it.at.there/path' }, 200).catch();
			await fm.fetchHandler('http://it.at.there/path');
			expect(fm.calls(true).length).to.equal(1);
			await fm.fetchHandler('http://it.at.there/path/abouts');
			await fm.fetchHandler('http://it.at.the');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('can use matcher and url simultaneously', async () => {
			fm.mock(
				{
					url: 'end:profile',
					matcher: (url, opts) => {
						return opts && opts.headers && opts.headers.authorized === true;
					},
				},
				200
			).catch();

			await fm.fetchHandler('http://it.at.there/profile');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/not', {
				headers: { authorized: true },
			});
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/profile', {
				headers: { authorized: true },
			});
			expect(fm.calls(true).length).to.equal(1);
		});

		it.skip('deprecated message on using functionMatcher (prefer matcher)', async () => {
			fm.mock(
				{
					url: 'end:profile',
					functionMatcher: (url, opts) => {
						return opts && opts.headers && opts.headers.authorized === true;
					},
				},
				200
			).catch();
		});

		it('can match Headers', async () => {
			fm.mock({ url: 'http://it.at.there/', headers: { a: 'b' } }, 200).catch();

			await fm.fetchHandler('http://it.at.there/', {
				headers: { a: 'c' },
			});
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/', {
				headers: { a: 'b' },
			});
			expect(fm.calls(true).length).to.equal(1);
		});

		it('can match query string', async () => {
			fm.mock({ url: 'http://it.at.there/', query: { a: 'b' } }, 200).catch();

			await fm.fetchHandler('http://it.at.there');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there?a=b');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('can match path parameter', async () => {
			fm.mock(
				{ url: 'express:/type/:instance', params: { instance: 'b' } },
				200
			).catch();
			await fm.fetchHandler('/');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('/type/a');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('/type/b');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('can match method', async () => {
			fm.mock({ url: 'http://it.at.there/', method: 'POST' }, 200).catch();

			await fm.fetchHandler('http://it.at.there/', { method: 'GET' });
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/', { method: 'POST' });
			expect(fm.calls(true).length).to.equal(1);
		});

		it('can match body', async () => {
			fm.mock(
				{ url: 'http://it.at.there/', body: { foo: 'bar' } },
				200
			).catch();

			await fm.fetchHandler('http://it.at.there/', {
				method: 'POST',
			});
			expect(fm.calls(true).length).to.equal(0);

			await fm.fetchHandler('http://it.at.there/', {
				method: 'POST',
				body: JSON.stringify({ foo: 'bar' }),
				headers: { 'Content-Type': 'application/json' },
			});
			expect(fm.calls(true).length).to.equal(1);
		});

		it('if no url provided, match any url', async () => {
			fm.mock(
				{
					headers: { a: 'b' },
				},
				200
			).catch();

			await fm.fetchHandler('http://it.at.anywhere/', {
				headers: { a: 'c' },
			});
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.anywhere/', {
				headers: { a: 'b' },
			});
			expect(fm.calls(true).length).to.equal(1);
		});

		it('support setting overwrite routes on matcher parameter', async () => {
			expect(() =>
				fm
					.mock('http://it.at.there/', 200)
					.mock({ url: 'http://it.at.there/', overwriteRoutes: true }, 300)
			).not.to.throw();

			const res = await fm.fetchHandler('http://it.at.there/');
			expect(res.status).to.equal(300);
		});

		it('support setting matchPartialBody on matcher parameter', async () => {
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
};
