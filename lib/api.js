const { progress, queueNotExistPrint } = require('./print');
const { createQueuesArray } = require('./helper');
const { initializeRegion } = require('./region');
const { PULL, SEND, DELETE } = require('./const');

const apiFunctions = (sqs) => {
    const createQueue = async (QueueName) => {
        const exists = await listQueues(QueueName);
        if (!exists) return await sqs.createQueue({ QueueName }).promise();
        return;
    };

    const listQueues = async (QueueNamePrefix) => {
        if (QueueNamePrefix === 0) {
            QueueNamePrefix = '';
        }

        return await sqs
            .listQueues({ QueueNamePrefix })
            .promise()
            .then((response) => {
                if (response.QueueUrls)
                    return createQueuesArray(response.QueueUrls);
                else return;
            });
    };

    const getMessages = async (sourceQueue, max) => {
        const QueueUrl = await getUrl(sourceQueue);
        const maxMessages = typeof max === 'undefined' ? 100 : max;

        let numOfMessages = parseInt(await getNumberOfMessages(QueueUrl));
        let progressBarMax = parseInt(maxMessages);
        let messagesSend = [],
            messagesDelete = [];

        const params = {
            QueueUrl,
            AttributeNames: ['All'],
            VisibilityTimeout: 20,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 0,
        };

        if (progressBarMax > numOfMessages) {
            //case there is fewer messages in SQS than provided as max
            progressBarMax = numOfMessages;
        }

        progress(messagesSend.length, progressBarMax, PULL);

        while (numOfMessages > 0) {
            if (messagesSend.length + 10 > maxMessages) {
                params.MaxNumberOfMessages = maxMessages - messagesSend.length;
            }
            await sqs
                .receiveMessage(params)
                .promise()
                .then((response) => {
                    if (response.Messages) {
                        for (const m of response.Messages) {
                            console.log(m);
                            const messageSend = {
                                Id: m.MessageId,
                                MessageBody: m.Body,
                            };
                            const messageDelete = {
                                Id: m.MessageId,
                                ReceiptHandle: m.ReceiptHandle,
                            };
                            messagesSend.push(messageSend);
                            messagesDelete.push(messageDelete);
                        }
                    }
                });
            if (messagesSend.length > progressBarMax) {
                //more messages became available in queue
                progressBarMax = messagesSend.length;
            }
            progress(messagesSend.length, progressBarMax, PULL);
            if (messagesSend.length === parseInt(maxMessages)) {
                break;
            }
            numOfMessages = await getNumberOfMessages(QueueUrl);
        }

        return [messagesSend, messagesDelete];
    };

    const sendMessagesBatch = async (targetQueue, messages) => {
        const QueueUrl = await getUrl(targetQueue);
        let params = {
            QueueUrl,
        };
        let startIndex = 0;
        while (startIndex < messages.length) {
            const batch = messages.slice(startIndex, startIndex + 10);
            console.log(batch);
            params.Entries = batch;
            await sqs.sendMessageBatch(params).promise();
            progress(startIndex, messages.length, SEND);
            startIndex = startIndex + 10;
        }
        progress(messages.length, messages.length, SEND);
    };

    const sendMessage = async (queueName, MessageBody) => {
        const QueueUrl = await getUrl(queueName);
        return await sqs
            .sendMessage({
                MessageBody,
                QueueUrl,
            })
            .promise();
    };

    // eslint-disable-next-line no-unused-vars
    const deleteMessage = async (QueueUrl, ReceiptHandle) => {
        return await sqs.deleteMessage({ QueueUrl, ReceiptHandle }).promise();
    };

    const deleteMessageBatch = async (messages, sourceQueue) => {
        const QueueUrl = await getUrl(sourceQueue);
        let params = {
            QueueUrl,
        };
        let startIndex = 0;
        while (startIndex < messages.length) {
            const batch = messages.slice(startIndex, startIndex + 10);
            params.Entries = batch;
            await sqs.deleteMessageBatch(params).promise();
            progress(startIndex, messages.length, DELETE);
            startIndex = startIndex + 10;
        }
        progress(messages.length, messages.length, DELETE);
    };

    const getUrl = async (source, target) => {
        return await Promise.all([listQueues(source), listQueues(target)]).then(
            (response) => {
                //check if source Queue exists
                if (typeof response[0] === 'undefined') {
                    queueNotExistPrint(source);
                    process.exit();
                }

                if (typeof target === 'undefined') {
                    return response[0][0].url;
                } else {
                    // check if target Queue exsits
                    if (typeof response[1] === 'undefined') {
                        queueNotExistPrint(target)
                        process.exit();
                    }

                    return [response[0][0].url, response[1][0].url];
                }
            }
        );
    };

    const getNumberOfMessages = async (QueueUrl) => {
        const AttributeNames = ['ApproximateNumberOfMessages'];
        return await sqs
            .getQueueAttributes({ QueueUrl, AttributeNames })
            .promise()
            .then((response) => {
                return response.Attributes.ApproximateNumberOfMessages;
            });
    };

    const deleteQueue = async (QueueName) => {
        let QueueUrl = '';
        const getQueueUrlResponse = await getQueueUrl(QueueName);
        if (getQueueUrlResponse) QueueUrl = getQueueUrlResponse['QueueUrl'];
        return await sqs.deleteQueue({ QueueUrl }).promise();
    };
    const getQueueUrl = async (QueueName) => {
        const queueUrl = await sqs.getQueueUrl({QueueName}).promise();
        return queueUrl;
    };


    return {
        createQueue,
        listQueues,
        getMessages,
        sendMessagesBatch,
        sendMessage,
        deleteMessageBatch,
        getUrl,
        deleteQueue
    };
};

const createAPI = async () => {
    try {
        const sqs = await initializeRegion();
        const API = apiFunctions(sqs);
        return API;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createAPI,
};
