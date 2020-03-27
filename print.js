const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const clui = require('clui'),
  Spinner = clui.Spinner;

const output = () => {
  const figletPrint = () => {
    clear();
    console.log(
      chalk.yellow(figlet.textSync('SQS Toolbox', { horizontalLayout: 'full' }))
    );
  };

  const queuesTable = sqsQueues => {
    if (sqsQueues.length == 0) {
      console.log(chalk.redBright('No queues were found!'));
    } else {
      console.log('List of SQS Queues');
      console.table(sqsQueues);
    }
  };

  const regionSet = region => {
    console.log(
      chalk.yellow(`You have changed the region to ${chalk.green(region)}`)
    );
  };

  const regionFormatError = region => {
    console.log(
      chalk.yellow(
        `\n Region value ${chalk.red(
          region
        )} is not in the correct format, please enter a valid region.`
      )
    );
  };

  const movingMessages = (source, target) => {
    const moving = new Spinner(
      `Moving messages from ${chalk.yellow(source)} to ${chalk.green(target)}`
    );
    moving.start();
  };

  return {
    figletPrint,
    queuesTable,
    regionFormatError,
    regionSet,
    movingMessages
  };
};

module.exports = {
  output
};
