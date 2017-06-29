const chalk = require(`chalk`);
const moment = require(`moment`);

if (process.env.DEV) {
	console.log(chalk.cyan(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] Starting in dev mode.`));
	require(`babel-register`);
	require(`./src/`);
}
else {
	console.log(chalk.cyan(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] Starting.`));
	require(`./build/`);
}
