const fetchMock = require('fetch-mock');

describe('describe', () => {
	it('single mock', () => {
		fetchMock.mock('blah', 200);
	})

	it('double mock', () => {
		fetchMock.mock('blah', 200).mock('bloop', 300);
	})

	it('single method', () => {
		fetchMock.get('blah', 200)
	})
	it('double method', () => {
		fetchMock.get('blah', 200).post('blah', 200)
	})
})
