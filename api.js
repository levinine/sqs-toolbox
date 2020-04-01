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

  const getMessages = async (s, max) => {
    const maxMessages = typeof max === 'undefined' ? 100 : max;
    const source = await listQueues(s).then(response => {
      return response[0].url;
    });
    const params = {
      QueueUrl: source,
      AttributeNames: ['All'],
      VisibilityTimeout: 20,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 10
    };

    let messages = [];
    let numOfMessages = parseInt(await getNumberOfMessages(source));
    let progressBarMax = parseInt(maxMessages);

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
            messages.push(message);
          }
        });

      print.pullingProgress(messages.length, progressBarMax);
      if (messages.length === parseInt(maxMessages)) {
        break;
      }
      numOfMessages = await getNumberOfMessages(source);
    }
    return messages;
  };

  const sendMessages = async (t, messages) => {
    const target = await listQueues(t).then(response => {
      return response[0].url;
    });
    const params = {
      QueueUrl: target
    };
    let startIndex = 0;
    while (startIndex < messages.length) {
      const batch = messages.slice(startIndex, startIndex + 10);
      params.Entries = batch;
      // await sqs.sendMessageBatch(params).promise().then(respo);
      sqs.sendMessageBatch(params, function(err, data) {
        if (err) console.log(err, err.stack);
        // an error occurred
        else console.log(data); // successful response
      });
      print.sendingProgress(startIndex, messages.length);
      startIndex = startIndex + 10;
    }
    print.sendingProgress(messages.length, messages.length);
  };

  return {
    listQueues,
    getMessages,
    sendMessages
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
