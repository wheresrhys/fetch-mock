const fetchMock = require('../../src/client');

self.addEventListener('install', ev => {
	fetchMock
			.mock(/.*/, 203)
	ev.waitUntil(fetch('http://egg.on.face/')
			.then(res => {
				if (res.status !== 203) {
					console.log('Fetch mock not behaving as expected')
					throw 'Unexpected status';
				}
			})
			.then(fetchMock.restore)
			.then(() => console.log('bing'))
	)
})

