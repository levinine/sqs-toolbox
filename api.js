const { output } = require('./print');
const print = output();
const { createQueuesArray } = require('./helper');

const apiFunctions = () => {
  const listQueues = async (namePrefix, sqs) => {
    if (namePrefix === 0) {
      namePrefix = '';
    }

    return await sqs
      .listQueues({ QueueNamePrefix: namePrefix })
      .promise()
      .then(response => {
        let sqsQueues = [];
        if (response.QueueUrls) {
          sqsQueues = createQueuesArray(response.QueueUrls);
        }
        return sqsQueues;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getMessages = async (source, target, sqs) => {
    const params = {
      QueueUrl: source[0].url,
      AttributeNames: ['All'],
      VisibilityTimeout: 0
    };
    return await sqs.receiveMessage(params);
  };

  return {
    listQueues,
    getMessages
  };
};

module.exports = {
  apiFunctions
};
