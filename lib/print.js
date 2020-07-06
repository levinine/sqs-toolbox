const figlet = require('figlet');
const chalk = require('chalk');
const clui = require('clui'),
    Progress = clui.Progress;
const progressBar = new Progress(40);

const figletPrint = (region) => {
    console.clear();
    console.log(
        chalk.yellow(
            figlet.textSync('SQS Toolbox', { horizontalLayout: 'full' })
        )
    );
    if (region) {
        console.log(
            chalk.yellow(`Your region is set to ${chalk.green(region)}`)
        );
    }
};

const queueCreatedSuccessfullyPrint = (queueName) => {
    console.log(`Queue ${chalk.green(queueName)} was created successfully`);
};

const queueAlreadyExistsPrint = (queueName) => {
    console.log(`Queue ${chalk.green(queueName)} already exists`);
};

const queuesTablePrint = (sqsQueues, namePrefix) => {
    if (typeof sqsQueues === 'undefined') {
        if (typeof namePrefix === 'undefined') {
            console.log(chalk.redBright('No queues were found!'));
        } else {
            console.log(
                chalk.redBright(
                    `Queue named ${chalk.yellow(namePrefix)} was not found!`
                )
            );
        }       
    } else {
        console.log('List of SQS Queues');
        console.table(sqsQueues);
    }
};

const regionSetPrint = (region) => {
    console.log(
        chalk.yellow(`You have changed the region to ${chalk.green(region)}`)
    );
};

const regionFormatErrorPrint = (region) => {
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

const messagesTablePrint = (messages, queueName, regularExpression) => {
    let regexMessage = '';
    if (typeof regularExpression != 'undefined') {
        regexMessage = `that match regular expression ${chalk.green(
            regularExpression
        )}`;
    }
    if (messages.length > 0) {
        console.log(
            `List of messages from ${chalk.green(
                queueName
            )} queue ${regexMessage}`
        );
        console.table(messages);
    } else {
        console.log(
            chalk.red(
                `No available messages were found in queue ${chalk.green(
                    queueName
                )} ${regexMessage}`
            )
        );
    }
};

const messageSentSuccessfullyPrint = (queueName, message) => {
    console.log(
        `Message: "${chalk.green(message)}" was sent to ${chalk.green(
            queueName
        )}`
    );
};

const messagesMovedSuccessfullyPrint = (number, source, target) => {
    console.log(
        chalk.green(
            `${number} messages have been moved sucessfully from ${chalk.yellow(
                source
            )} to ${chalk.yellow(target)}`
        )
    );
};

const messagesDeletedSuccessfullyPrint = (number, source) => {
    console.log(
        chalk.green(
            `${number} messages have been deleted sucessfully from ${chalk.yellow(
                source
            )}`
        )
    );
};

module.exports = {
    figletPrint,
    queueCreatedSuccessfullyPrint,
    queuesTablePrint,
    regionFormatErrorPrint,
    regionSetPrint,
    progress,
    messagesMovedSuccessfullyPrint,
    messageSentSuccessfullyPrint,
    messagesDeletedSuccessfullyPrint,
    messagesTablePrint,
    queueAlreadyExistsPrint
};
