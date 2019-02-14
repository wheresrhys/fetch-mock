/* eslint-disable no-console */
function isTrue(value) {
	return !!value && value !== "0" && value !== "false"
}

var envDisable = isTrue(process.env.CI);
var logLevel = process.env.npm_config_loglevel;
var logLevelDisplay = ['silent', 'error', 'warn'].indexOf(logLevel) > -1;

if (!envDisable && !logLevelDisplay) {
	const green = '\u001b[32m';
	const white = '\u001b[22m\u001b[39m';
	const boldCyan = '\u001b[96m\u001b[1m';
	const reset = '\u001b[0m';

	const output =
		green +
		'Have some ❤️ for fetch-mock? Why not donate to my charity of choice:' +
		white +
		'\n > ' +
		boldCyan +
		'https://www.justgiving.com/refugee-support-europe\n' +
		reset;

	console.log(output);
}
