const { output } = require('./print');
const print = output();
const { createQueuesArray } = require('./helper');
const { initializeRegion } = require('./region');
const { PULL, SEND, DELETE } = require('./const');

const apiFunctions = sqs => {
  const listQueues = async QueueNamePrefix => {
    if (QueueNamePrefix === 0) {
      QueueNamePrefix = '';
    }

    return await sqs
      .listQueues({ QueueNamePrefix })
      .promise()
      .then(response => {
        let sqsQueues = [];
        if (response.QueueUrls) {
          sqsQueues = createQueuesArray(response.QueueUrls);
          return sqsQueues;
        } else {
          print.noQueuesFound(QueueNamePrefix);
          return sqsQueues;
        }
      });
  };

  const getNumberOfMessages = async QueueUrl => {
    const AttributeNames = ['ApproximateNumberOfMessages'];
    return await sqs
      .getQueueAttributes({ QueueUrl, AttributeNames })
      .promise()
      .then(response => {
        return response.Attributes.ApproximateNumberOfMessages;
      });
  };

  const getMessages = async (QueueUrl, max) => {
    const maxMessages = typeof max === 'undefined' ? 100 : max;
    let messages = [];
    let deleteMessages = [];
    let numOfMessages = parseInt(await getNumberOfMessages(QueueUrl));
    let progressBarMax = parseInt(maxMessages);
    const params = {
      QueueUrl,
      AttributeNames: ['All'],
      VisibilityTimeout: 20,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 0
    };

    //case there is fewer messages in SQS than provided as max
    if (progressBarMax > numOfMessages) {
      progressBarMax = numOfMessages;
    }

    print.progress(messages.length, progressBarMax, PULL);

    while (numOfMessages > 0) {
      if (messages.length + 10 > maxMessages) {
        params.MaxNumberOfMessages = maxMessages - messages.length;
      }
      await sqs
        .receiveMessage(params)
        .promise()
        .then(response => {
          for (const m of response.Messages) {
            const message = {
              Id: m.MessageId,
              MessageBody: m.Body
            };
            const deleteMessage = {
              Id: m.MessageId,
              ReceiptHandle: m.ReceiptHandle
            };
            messages.push(message);
            deleteMessages.push(deleteMessage);
          }
        });
      print.progress(messages.length, progressBarMax, PULL);
      if (messages.length === parseInt(maxMessages)) {
        break;
      }
      numOfMessages = await getNumberOfMessages(QueueUrl);
    }

    return [messages, deleteMessages];
  };

  const sendMessages = async (QueueUrl, messages) => {
    let params = {
      QueueUrl
    };
    let startIndex = 0;
    while (startIndex < messages.length) {
      const batch = messages.slice(startIndex, startIndex + 10);
      params.Entries = batch;
      await sqs.sendMessageBatch(params).promise();
      print.progress(startIndex, messages.length, SEND);
      startIndex = startIndex + 10;
    }
    print.progress(messages.length, messages.length, SEND);
  };

  const deleteMessageBatch = async (QueueUrl, messages, s, t) => {
    let params = {
      QueueUrl
    };
    let startIndex = 0;
    while (startIndex < messages.length) {
      const batch = messages.slice(startIndex, startIndex + 10);
      params.Entries = batch;
      await sqs.deleteMessageBatch(params).promise();
      print.progress(startIndex, messages.length, DELETE);
      startIndex = startIndex + 10;
    }
    print.progress(messages.length, messages.length, DELETE);
    print.messagesMovedSuccessfully(messages.length, s, t);
  };

  return {
    listQueues,
    getMessages,
    sendMessages,
    deleteMessageBatch
  };
};

const createAPI = async () => {
  const sqs = await initializeRegion();
  const API = apiFunctions(sqs);
  return API;
};

module.exports = {
  createAPI
};
