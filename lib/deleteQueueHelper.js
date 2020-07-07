const { prompt } = require('inquirer');
const { exec } = require('child_process');
const { queueDeletionAnswerFormatErrorPrint } = require('../lib/print');

const yesOrNoRegExp = RegExp('Y|N');

const yesNoEnum = {
    YES: 'Y',
    NO: 'N'
}
const promptForQueueDeletion = async (queueName) => {
    return new Promise((resolve) => {
        exec('get deletion confirmation', (error, stdout, stderr) => {
            if (error || stderr) {
                resolve(deleteMessageConfirmationInput(queueName));
            } else {
                resolve(stdout);
            }
        });
    });
};

const promptForQueuePurging = async (queueName) => {
    return new Promise((resolve) => {
        exec('get purging confirmation', (error, stdout, stderr) => {
            if (error || stderr) {
                resolve(purgeQueueMessageConfirmationInput(queueName));
            } else {
                resolve(stdout);
            }
        });
    });
};

const purgeQueueMessageConfirmationInput = async (queueName) => {
    const question = {
        type: 'input',
        name: 'purgingConfirmation',
        message: `Any messages in the queue will no longer be available.\nAre you sure you want to purge ${queueName} queue? (Y/N)`,
        validate: checkDeleteQueueAnswer,
        default: 'N',
    };
    const purgingConfirmation = prompt([question])
        .then((answer) => {
            return answer.purgingConfirmation;
        })
        .catch((error) => {
            console.log(error);
        });
    return purgingConfirmation;
};

const deleteMessageConfirmationInput = async (queueName) => {
    const question = {
        type: 'input',
        name: 'deletionConfirmation',
        message: `Any messages in the queue will no longer be available.\nAre you sure you want to delete ${queueName} queue? (Y/N)`,
        validate: checkDeleteQueueAnswer,
        default: 'N',
    };
    const deletionConfirmation = prompt([question])
        .then((answer) => {
            return answer.deletionConfirmation;
        })
        .catch((error) => {
            console.log(error);
        });
    return deletionConfirmation;
};

const checkDeleteQueueAnswer = (answer) => {
    if (yesOrNoRegExp.test(answer)) return true;
    else queueDeletionAnswerFormatErrorPrint(answer);
};

module.exports = {
    checkDeleteQueueAnswer,
    deleteMessageConfirmationInput,
    promptForQueueDeletion,
    promptForQueuePurging,
    yesNoEnum
}