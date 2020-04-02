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
  createQueuesArray
};
