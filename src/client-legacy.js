import babel from 'babel-core'

babel.transform('code', {
	plugins: ['transform-runtime']
});

export default from './client';
