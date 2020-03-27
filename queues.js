const { queuesTableMessage } = require('./messages');

const queuesAPI = async (namePrefix, sqs) => {
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
      queuesTableMessage(sqsQueues);
      return sqsQueues;
    })
    .catch(error => {
      console.log(error);
    });
};

const createQueuesArray = sqsResponse => {
  let sqsQueues = [];
  let queue = {};

  sqsResponse.forEach(q => {
    queue = {
      name: q.slice(q.lastIndexOf('/') + 1),
      url: q
    };
    sqsQueues.push(queue);
  });

  return sqsQueues;
};

module.exports = {
  queuesAPI
};
