const debug = require('debug');

let debugFunc;
let phase = 'default';
let namespace = '';
const newDebug = () => {
	debugFunc = namespace
		? debug(`fetch-mock:${phase}:${namespace}`)
		: debug(`fetch-mock:${phase}`);
};

const newDebugSandbox = (ns) => debug(`fetch-mock:${phase}:${ns}`);

newDebug();

module.exports = {
	debug: (...args) => {
		debugFunc(...args);
	},
	setDebugNamespace: (str) => {
		namespace = str;
		newDebug();
	},
	setDebugPhase: (str) => {
		phase = str || 'default';
		newDebug();
	},
	getDebug: (namespace) => newDebugSandbox(namespace),
};
