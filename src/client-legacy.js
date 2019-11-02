import babel from 'babel-core'

babel.transform('code', {
	plugins: ['transform-runtime']
});
import fetchMock from './client'
export default fetchMock;
