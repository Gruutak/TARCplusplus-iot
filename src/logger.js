import moment from 'moment';
import chalk from 'chalk';

function info(msg) {
	console.log(chalk.cyan(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}]`), chalk.cyan(msg));
}

function warn(msg) {
	console.log(chalk.cyan(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}]`), chalk.yellow(msg));
}

function error(msg) {
	console.log(chalk.cyan(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}]`), chalk.red(msg));
}

export default { info, warn, error };
