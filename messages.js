const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');

const figletMessage = () => {
  clear();
  console.log(
    chalk.yellow(figlet.textSync('SQS Toolbox', { horizontalLayout: 'full' }))
  );
};

const queuesTableMessage = sqsQueues => {
  if (sqsQueues.length == 0) {
    console.log(chalk.redBright('No queues were found!'));
  } else {
    console.log('List of SQS Queues');
    console.table(sqsQueues);
  }
};

const regionSetMessage = region => {
  console.log(
    chalk.yellow(`You have changed the region to ${chalk.green(region)}`)
  );
};

const regionFormatErrorMessage = region => {
  console.log(
    chalk.yellow(
      `\n Region value ${chalk.red(
        region
      )} is not in the correct format, please enter a valid region.`
    )
  );
};

module.exports = {
  figletMessage,
  queuesTableMessage,
  regionSetMessage,
  regionFormatErrorMessage
};
