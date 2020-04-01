const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const clui = require('clui'),
  Spinner = clui.Spinner,
  Progress = clui.Progress;

const output = () => {
  const figletPrint = () => {
    clear();
    console.log(
      chalk.yellow(figlet.textSync('SQS Toolbox', { horizontalLayout: 'full' }))
    );
  };

  const noQueuesFound = namePrefix => {
    if (namePrefix == '') {
      console.log(chalk.redBright('No queues were found!'));
    } else {
      console.log(
        chalk.redBright(
          `Queue named ${chalk.yellow(namePrefix)} was not found!`
        )
      );
    }
  };

  const queuesTable = sqsQueues => {
    console.log('List of SQS Queues');
    console.table(sqsQueues);
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

  const pullingProgress = (current, max) => {
    const progress = new Progress(40);
    if (max == 0) {
      console.log(chalk.red('No messages available!'));
    } else {
      clear();
      console.log(
        `Pulled ${current} of ${max} messages` + progress.update(current, max)
      );
    }
  };

  const sendingProgress = (current, max) => {
    const progress = new Progress(40);
    if (max == 0) {
      console.log(chalk.red('No messages available!'));
    } else {
      clear();
      console.log(
        `Sent ${current} of ${max} messages` + progress.update(current, max)
      );
    }
  };

  const messagesMovedSuccessfully = number => {
    console.log(chalk.green(`${number} messages have been moved sucessfully`));
  };

  return {
    figletPrint,
    queuesTable,
    regionFormatError,
    regionSet,
    pullingProgress,
    sendingProgress,
    noQueuesFound,
    messagesMovedSuccessfully
  };
};

module.exports = {
  output
};
