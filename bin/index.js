#!/usr/bin/env node

const { program } = require('commander');
const { createAPI } = require('../lib/api');
const { getRegion } = require('../lib/conf');
const { MOVE_MESSAGE, DELETE_MESSAGE } = require('../lib/const');
const {
    regexSelectMessage,
    createDeleteArray,
    promptForFurtherAction,
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
    queuePurgedSuccessfullyPrint
} = require('../lib/print');

const { promptForQueueDeletion, yesNoEnum, promptForQueuePurging } = require('../lib/deleteQueueHelper')

// // justfortesting;
// const Conf = require('conf');
// const config = new Conf();
// config.delete('region');

figletPrint(getRegion());

const moveMessages = async (sourceQueue, targetQueue, maxMessages) => {
    try {
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

const peekMessages = async (sourceQueue, maxMessages) => {
    try {
        const API = await createAPI();
        const messages = await API.getMessages(sourceQueue, maxMessages).then(
            (response) => {
                return response[0];
            }
        );
        messagesTablePrint(messages, sourceQueue);
        return messages;
    } catch (error) {
        console.log(error);
    }
};

const selectMessages = async (sourceQueue, regularExpression) => {
    try {
        const API = await createAPI();
        const [allMessages, deleteMessages] = await API.getMessages(sourceQueue);
        
        const regexSelectedMessages = regexSelectMessage(
            allMessages,
            regularExpression
        );
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
                }
            );
        }
    } catch (error) {
        console.log(error);
    }
};

const sendMessage = async (queueName, message) => {
    try {
        const API = await createAPI();
        await API.sendMessage(queueName, message);
        messageSentSuccessfullyPrint(queueName, message);
    } catch (error) {
        console.log(error);
    }
};

const createQueue = async (queueName) => {
    try {
        const API = await createAPI();
        const createQueueResult = await API.createQueue(queueName);
        if (!createQueueResult) queueAlreadyExistsPrint(queueName);
        else queueCreatedSuccessfullyPrint(queueName);
    } catch (error) {
        console.log(error);
    }
};

const listQueues = async (namePrefix) => {
    try {
        const API = await createAPI();
        const sqsQueues = await API.listQueues(namePrefix);
        queuesTablePrint(sqsQueues, namePrefix);
        return sqsQueues;
    } catch (error) {
        console.log(error);
    }
};

const deleteQueue = async (queueName) => {
    try {
        const deleteMessageConfirmationResult = await promptForQueueDeletion(queueName);
        if (deleteMessageConfirmationResult === yesNoEnum.NO) return;
        if (deleteMessageConfirmationResult === yesNoEnum.YES) {
            const API = await createAPI();
            const deleteQueueResult = await API.deleteQueue(queueName);
            if (!deleteQueueResult) queueNotExistPrint(queueName);
            else queueDeletedSuccessfullyPrint(queueName);
        }
    } catch (error) {
        console.log(error);
    }
};

const purgeQueue = async (queueName) => {
    try {
        const purgeMessagesConfirmationResult = await promptForQueuePurging(queueName);
        if (purgeMessagesConfirmationResult === yesNoEnum.NO) return;
        if (purgeMessagesConfirmationResult === yesNoEnum.YES) {
            const API = await createAPI();
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
    .option('-r, --region <regionName>', 'Set region');

program
    .command('list-queues [namePrefix]')
    .description('List all queues')
    .action(listQueues);

program
    .command('move <sourceQueueName> <destinationQueueName> [maxMessages]')
    .description('Move a message from one queue to another')
    .action(moveMessages);

program
    .command('peek <queueName> [maxMessages]')
    .description('List messages from SQS queue')
    .action(peekMessages);

program
    .command('select <queueName> [regularExpression]')
    .description('Select messages by regular expression')
    .action(selectMessages);

program
    .command('send <queueName> <message>')
    .description('Send a message to a specific queue')
    .action(sendMessage);

program
    .command('create <queueName>')
    .description('Create a queue')
    .action(createQueue);

program
    .command('delete <queueName>')
    .description('Delete a queue')
    .action(deleteQueue);

program
    .command('purge <queueName>')
    .description('Purge a queue')
    .action(purgeQueue);

program.parse(process.argv);
