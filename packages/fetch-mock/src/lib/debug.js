import nodeDebug from 'debug';

let debugFunc;
let phase = 'default';
let namespace = '';
const newDebug = () => {
	debugFunc = namespace
		? nodeDebug(`fetch-mock:${phase}:${namespace}`)
		: nodeDebug(`fetch-mock:${phase}`);
};

const newDebugSandbox = (ns) => nodeDebug(`fetch-mock:${phase}:${ns}`);

newDebug();

export const debug = (...args) => {
	debugFunc(...args);
};
export const setDebugNamespace = (str) => {
	namespace = str;
	newDebug();
};
export const setDebugPhase = (str) => {
	phase = str || 'default';
	newDebug();
};
export const getDebug = (namespace) => newDebugSandbox(namespace);
