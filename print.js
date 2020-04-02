const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const clui = require('clui'),
  Progress = clui.Progress;
const progressBar = new Progress(40);

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

  const progress = (current, max, type) => {
    if (max == 0) {
      console.log(chalk.red('No messages available!'));
    }
    switch (type) {
      case 'pull':
        console.clear();
        console.log(
          `Pulled ${current} of ${max} messages` +
            progressBar.update(current, max)
        );
        break;
      case 'send':
        console.clear();
        console.log(
          `Sent ${current} of ${max} messages` +
            progressBar.update(current, max)
        );
        break;
      case 'delete':
        console.clear();
        console.log(
          `Deleted ${current} of ${max} messages` +
            progressBar.update(current, max)
        );
        break;
      default:
        console.log('You are missing a progress type in the invocation');
    }
  };

  const messagesMovedSuccessfully = (number, source, target) => {
    console.log(
      chalk.green(
        `${number} messages have been moved sucessfully from ${chalk.yellow(
          source
        )} to ${chalk.yellow(target)}`
      )
    );
  };

  return {
    figletPrint,
    queuesTable,
    regionFormatError,
    regionSet,
    progress,
    noQueuesFound,
    messagesMovedSuccessfully
  };
};

module.exports = {
  output
};
