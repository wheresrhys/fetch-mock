// Ideally would run the entire test suite, but then would need to get into
// transpiling all the tests, which muddies the waters a bit
// So instead just making sure there are no syntax errors or issues with
// missing globals or methods
const fetchMock = require('../es5/server');

fetchMock.mock('http://it.at.there/', 200);
fetchMock.fetchHandler('http://it.at.there/').catch(() => process.exit(2));
