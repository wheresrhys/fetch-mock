const expect = require('chai').expect;
describe('service worker', () => {
	it('should work within a service worker', () => {
		return navigator.serviceWorker && navigator.serviceWorker.register('__sw.js')
			.then(registration => {
				return new Promise((resolve, reject) => {
					if (registration.installing) {
						registration.installing.onstatechange = function () {
							if (this.state === 'activated') {
								resolve();
							}
						}
					} else {
						reject('No idea what happened');
					}
				})
					.then(() => {
						expect(true).to.be.true;
						return navigator.serviceWorker.getRegistration()
							.then(registration => registration ? registration.unregister() : false);
					})


			})
	})
})
