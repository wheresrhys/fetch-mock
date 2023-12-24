require('@babel/core').transform('code', {
	plugins: ['transform-runtime'],
});

export default require('./client');
