require('@babel/core').transform('code', {
	plugins: ['transform-runtime'],
});

module.exports = require('./client');
