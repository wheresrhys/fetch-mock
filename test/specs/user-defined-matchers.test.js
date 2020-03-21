const chai = require('chai');
const expect = chai.expect;

module.exports = fetchMock => {
	describe('user defined matchers', () => {
		let fm;
		before(() => {
			fm = fetchMock.createInstance();
		});

		it('match on sync property', async () => {
			fm.addCustomMatcher({
				name: 'syncMatcher',
				matcher: input => {
					return (url, options, request) => url.indexOf(input) > 10
				}
			})
			fm.mock({
				syncMatcher: 'lime'
			}, 200).catch();
			await fm.fetchHandler('http://lime.at.there');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('http://it.at.there/lime');
			expect(fm.calls(true).length).to.equal(1);
		});

		it('match on sync property', async () => {
			fm.addCustomMatcher({
				name: 'asyncBodyMatcher',
				matcher: input =>
					(url, options, request) => options.body[input] === true,

				usesBody: true
			})
			fm.mock({
				asyncBodyMatcher: 'lime'
			}, 200).catch();
			await fm.fetchHandler(new fm.config.Request('http://it.at.there', {
				body: JSON.stringify({lemon: true})
			}));
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler(new fm.config.Request('http://it.at.there', {
				body: JSON.stringify({lime: true})
			}));
			expect(fm.calls(true).length).to.equal(1);
		});





	});
};
