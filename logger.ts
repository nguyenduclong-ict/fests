import chalk from 'chalk'

export default {
    log(...args) {
        console.log(...args)
    },
    error(prefix, ...args) {
        console.log(chalk.bold.red(prefix || 'ERROR'), ...args)
    },
    warning(prefix, ...args) {
        console.log(chalk.bold.yellow(prefix || 'WARNING'), ...args)
    },
    info(prefix, ...args) {
        console.log(chalk.bold.green(prefix || 'INFO'), ...args)
    },
}
