#!/usr/bin/env node

const { program } = require('commander');
const { createAPI } = require('../lib/api');
const { getRegion } = require('../lib/conf');
const { MOVE_MESSAGE, DELETE_MESSAGE } = require('../lib/const');
const {
    regexSelectMessage,
    createDeleteArray,
    promptForFurtherAction,
    getParameters
} = require('../lib/helper');
const {
    figletPrint,
    queuesTablePrint,
    messagesTablePrint,
    messageSentSuccessfullyPrint,
    messagesMovedSuccessfullyPrint,
    messagesDeletedSuccessfullyPrint,
    queueCreatedSuccessfullyPrint,
    queueAlreadyExistsPrint,
    queueNotExistPrint,
    queueDeletedSuccessfullyPrint,
    queuePurgedSuccessfullyPrint,
    queueNotExistCannotBeDeletedPrint,
    queueNotExistCannotBePurgedPrint,
    queueNotExistCannotBeSelectedPrint
} = require('../lib/print');

const { yesNoEnum, purgeQueueMessageConfirmationInput, deleteMessageConfirmationInput } = require('../lib/deleteQueueHelper')

// // justfortesting;
// const Conf = require('conf');
// const config = new Conf();
// config.delete('region');

figletPrint(getRegion());

const moveMessages = async () => {
    try {
        const [requiredParameters, optionalParameters] = getParameters('move');
        const sourceQueue = requiredParameters['sourceQueue'];
        const targetQueue = requiredParameters['targetQueue'];
        const maxMessages = optionalParameters['maxMessages'];

        const API = await createAPI();
        const [messagesSend, messagesDelete] = await API.getMessages(
            sourceQueue,
            maxMessages
        );
        if (messagesSend.length > 0) {
            await API.sendMessagesBatch(targetQueue, messagesSend).then(
                async () => {
                    await API.deleteMessageBatch(messagesDelete, sourceQueue);
                    messagesMovedSuccessfullyPrint(
                        messagesDelete.length,
                        sourceQueue,
                        targetQueue
                    );
                }
            );
        }

        return messagesSend;
    } catch (error) {
        console.log(error);
    }
};

const copyMessages = async () => {
    const [requiredParameters, optionalParameters] = getParameters('copy');
    const sourceQueue = requiredParameters['sourceQueue'];
    const targetQueue = requiredParameters['targetQueue'];
    const maxMessages = optionalParameters['maxMessages'];
    try {
        const API = await createAPI();
        const [messagesSend] = await API.getMessages(
            sourceQueue,
            maxMessages
        );
        if (messagesSend.length > 0) {
            await API.sendMessagesBatch(targetQueue, messagesSend).then();
        }

        return messagesSend;
    } catch (error) {
        console.log(error);
    }
};

const peekMessages = async () => {
    try {
        const [requiredParameters, optionalParameters] = getParameters('peek');
        const queueName = requiredParameters['queueName'];
        const maxMessages = optionalParameters['maxMessages'];

        const API = await createAPI();
        const messages = await API.getMessages(queueName, maxMessages, 10).then(
            (response) => {
                return response[0];
            }
        );
        messagesTablePrint(messages, queueName);
        return messages;
    } catch (error) {
        console.log(error);
    }
};

const selectMessages = async () => {
    try {
        const [ requiredParameters, optionalParameters ] = getParameters('select');
        const sourceQueue = requiredParameters['queueName'];
        const regularExpression = optionalParameters['regularExpression'];

        const API = await createAPI();
        const queueExisits = await API.checkIfQueueExists(sourceQueue);
        if (!queueExisits) {
            queueNotExistCannotBeSelectedPrint(sourceQueue);
            return;
        }
        const [allMessages, deleteMessages] = await API.getMessages(sourceQueue);

        let regexSelectedMessages = [];
        if(regularExpression) {
            regexSelectedMessages = regexSelectMessage(
                allMessages,
                regularExpression
            );
        } else {
            regexSelectedMessages = allMessages;
        }

        messagesTablePrint(
            regexSelectedMessages,
            sourceQueue,
            regularExpression
        );
        if (regexSelectedMessages.length > 0) {
            await promptForFurtherAction(regexSelectedMessages).then(
                async (response) => {
                    if (response.action) {
                        const deleteArray = createDeleteArray(
                            response.messages,
                            deleteMessages
                        );

                        if (response.action === MOVE_MESSAGE) {
                            if (response.messages.length > 0) {
                                await API.sendMessagesBatch(
                                    response.targetQueueName,
                                    response.messages
                                ).then(async () => {
                                    await API.deleteMessageBatch(
                                        deleteArray,
                                        sourceQueue
                                    );
                                    messagesMovedSuccessfullyPrint(
                                        deleteArray.length,
                                        sourceQueue,
                                        response.targetQueueName
                                    );
                                });
                            }
                        } else if (response.action === DELETE_MESSAGE) {
                            await API.deleteMessageBatch(
                                deleteArray,
                                sourceQueue
                            );
                            messagesDeletedSuccessfullyPrint(
                                deleteArray.length,
                                sourceQueue
                            );
                        }
                    }
                }
            );
        }
    } catch (error) {
        console.log(error);
    }
};

const sendMessage = async () => {
    try {
        const requiredParameters = getParameters('send')[0];
        const queueName = requiredParameters['queueName'];
        const message = requiredParameters['message'];

        const API = await createAPI();
        await API.sendMessage(queueName, message);
        messageSentSuccessfullyPrint(queueName, message);
    } catch (error) {
        console.log(error);
    }
};

const createQueue = async () => {
    try {
        const requiredParameters = getParameters('create')[0];
        const queueName = requiredParameters['queueName'];

        const API = await createAPI();
        const createQueueResult = await API.createQueue(queueName);

        if (!createQueueResult) queueAlreadyExistsPrint(queueName);
        else queueCreatedSuccessfullyPrint(queueName);

    } catch (error) {
        console.log(error);
    }
};

const listQueues = async () => {
    try {
        const optionalParameters = getParameters('list-queues')[1];
        const namePrefix = optionalParameters['namePrefix'];

        const API = await createAPI();
        const sqsQueues = await API.listQueues(namePrefix);

        queuesTablePrint(sqsQueues, namePrefix);
        return sqsQueues;

    } catch (error) {
        console.log(error);
    }
};

const deleteQueue = async () => {
    try {
        const requiredParameters = getParameters('delete')[0];
        const queueName = requiredParameters['queueName'];
        const API = await createAPI();
        const queueExisits = await API.checkIfQueueExists(queueName);
        if (!queueExisits) {
            queueNotExistCannotBeDeletedPrint(queueName);
            return;
        }

        const deleteMessageConfirmationResult = await deleteMessageConfirmationInput(queueName);
        if (deleteMessageConfirmationResult === yesNoEnum.NO) return;
        if (deleteMessageConfirmationResult === yesNoEnum.YES) {
            const deleteQueueResult = await API.deleteQueue(queueName);
            if (!deleteQueueResult) queueNotExistPrint(queueName);
            else queueDeletedSuccessfullyPrint(queueName);
        }
    } catch (error) {
        console.log(error);
    }
};

const purgeQueue = async () => {
    try {
        const requiredParameters = getParameters('purge')[0];
        const queueName = requiredParameters['queueName'];
        const API = await createAPI();
        const queueExisits = await API.checkIfQueueExists(queueName);
        if (!queueExisits) {
            queueNotExistCannotBePurgedPrint(queueName);
            return;
        }
        const purgeMessagesConfirmationResult = await purgeQueueMessageConfirmationInput(queueName);
        if (purgeMessagesConfirmationResult === yesNoEnum.NO) return;
        if (purgeMessagesConfirmationResult === yesNoEnum.YES) {
            const prugeQueue = await API.purgeQueue(queueName);
            if (!prugeQueue) queueNotExistPrint(queueName);
            else queuePurgedSuccessfullyPrint(queueName);
        }
    } catch (error) {
        console.log(error);
    }
};

// CLI commands
program
    .version('1.0.0')
    .option('-r, --region <regionName>', 'Set region')
    .option('-np, --namePrefix <namePrefix>', 'Set name prefix')
    .option('-qn, --queueName <queueName>', 'Set queue name')
    .option('-sq, --sourceQueue <sourceQueue>', 'Set source queue')
    .option('-tq, --targetQueue <targetQueue>', 'Set target queue')
    .option('-mm, --maxMessages <maxMessages>', 'Set max messages')
    .option('-re, --regularExpression <regularExpression>', 'Set regular expression')
    .option('-mg, --message <message>', 'Set message');

program
    .command('list-queues')
    .description('List all queues')
    .action(listQueues);

program
    .command('move')
    .description('Move a message from one queue to another')
    .action(moveMessages);

program
    .command('peek')
    .description('List messages from SQS queue')
    .action(peekMessages);

program
    .command('select')
    .description('Select messages by regular expression')
    .action(selectMessages);

program
    .command('send')
    .description('Send a message to a specific queue')
    .action(sendMessage);

program
    .command('create')
    .description('Create a queue')
    .action(createQueue);

program
    .command('delete')
    .description('Delete a queue')
    .action(deleteQueue);

program
    .command('copy')
    .description('Copy messages from one queue to another')
    .action(copyMessages);

program
    .command('purge')
    .description('Purge a queue')
    .action(purgeQueue);

program.parse(process.argv);
