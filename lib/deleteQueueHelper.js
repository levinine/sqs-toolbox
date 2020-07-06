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
        exec('aws configure get region', (error, stdout, stderr) => {
            if (error || stderr) {
                resolve(deleteMessageConfirmationInput(queueName));
            } else {
                resolve(stdout);
            }
        });
    });
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
    yesNoEnum
}