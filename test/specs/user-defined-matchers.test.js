const chai = require('chai');
const expect = chai.expect;

const {fetchMock} = testGlobals;
	describe('user defined matchers', () => {
		it('match on sync property', async () => {
			const fm = fetchMock.createInstance();
			fm.addMatcher({
				name: 'syncMatcher',
				matcher: (route) => (url) => url.indexOf(route.syncMatcher) > 10,
			});
			fm.mock(
				{
					syncMatcher: 'lime',
				},
				200
			).catch();
			await fm.fetchHandler('http://lime.at.there');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/lime');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('match on async body property', async () => {
			const fm = fetchMock.createInstance();
			fm.addMatcher({
				name: 'asyncBodyMatcher',
				matcher: (route) => (url, options, request) =>
					request && JSON.parse(options.body)[route.asyncBodyMatcher] === true,
				usesBody: true,
			});
			fm.mock(
				{
					asyncBodyMatcher: 'lime',
				},
				200
			).catch();
			await fm.fetchHandler(
				new fm.config.Request('http://it.at.there', {
					method: 'POST',
					body: JSON.stringify({ lemon: true }),
				})
			);
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler(
				new fm.config.Request('http://it.at.there', {
					method: 'POST',
					body: JSON.stringify({ lime: true }),
				})
			);
			expect(fm.calls(true).length).to.equal(1);
		});
	});
