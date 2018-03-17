// Ideally woudl run the entire test suite, but then woudl need to get into
// transpiling all the tests, which muddies the waters a bit
// So instead just making sure there are no syntax errors or issues with
// missing globals or ethods
require('babel-polyfill');
const fetchMock = require('../es5/server');

fetchMock.mock('http://it.at.there/', 200);
return fetchMock.fetchHandler('http://it.at.there/')
	.then(res => expect(res.ok).to.be.true)
