const { output } = require('./print');
const print = output();
const { createQueuesArray } = require('./helper');
const { initializeRegion } = require('./region');

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
          print.noQueuesFound(namePrefix);
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
    let entries = [];
    let numOfMessages = parseInt(await getNumberOfMessages(QueueUrl));
    let progressBarMax = parseInt(maxMessages);
    const params = {
      QueueUrl,
      AttributeNames: ['All'],
      VisibilityTimeout: 20,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 10
    };

    //case there is fewer messages in SQS than provided as max
    if (progressBarMax > numOfMessages) {
      progressBarMax = numOfMessages;
    }

    print.pullingProgress(messages.length, progressBarMax);

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
            const entry = {
              Id: m.MessageId,
              ReceiptHandle: m.ReceiptHandle
            };
            messages.push(message);
            entries.push(entry);
          }
        });
      print.pullingProgress(messages.length, progressBarMax);
      if (messages.length === parseInt(maxMessages)) {
        break;
      }
      numOfMessages = await getNumberOfMessages(QueueUrl);
    }

    return [messages, entries];
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
      print.sendingProgress(startIndex, messages.length);
      startIndex = startIndex + 10;
    }
    print.sendingProgress(messages.length, messages.length);
  };

  const deleteMessages = async (QueueUrl, Entries) => {
    await sqs
      .deleteMessageBatch({ Entries, QueueUrl })
      .promise()
      .then(response => {
        if (response.Successful) {
          print.messagesMovedSuccessfully(response.Successful.length);
        }
      });
  };

  return {
    listQueues,
    getMessages,
    sendMessages,
    deleteMessages
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
