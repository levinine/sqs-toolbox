const { prompt } = require('inquirer');
const {
  FURTHER_ACTION_QUESTION,
  MOVE_MESSAGE,
  DELETE_MESSAGE,
  TARGET_QUESTION
} = require('./const');

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

const createDeleteArray = (selectedMessages, deleteMessages) => {
  let deleteMessagesArray = [];
  console.log(selectedMessages);
  for (const m of selectedMessages) {
    for (const d of deleteMessages) {
      if (m.Id === d.Id) {
        console.log(m.Id);
        console.log(d.Id);
        deleteMessagesArray.push(d);
      }
    }
  }
  return deleteMessagesArray;
};

const regexSelectMessage = (messages, regularExpression) => {
  const regex = RegExp(regularExpression);
  let matchedMessages = [];
  for (const m of messages) {
    if (regex.test(m.MessageBody)) {
      matchedMessages.push(m);
    }
  }
  return matchedMessages;
};

const promptForFurtherAction = async regexSelectedMessages => {
  return await prompt(FURTHER_ACTION_QUESTION).then(async answer => {
    let response = {};
    if (answer.furtherAction === MOVE_MESSAGE) {
      const targetQueueName = await prompt(TARGET_QUESTION).then(answer => {
        return answer.targetQueue;
      });
      const messagesForMoving = await checkBoxList(
        regexSelectedMessages,
        'move'
      );

      response = {
        action: MOVE_MESSAGE,
        messages: messagesForMoving,
        targetQueueName: targetQueueName
      };
    } else if (answer.furtherAction === DELETE_MESSAGE) {
      const messagesForDeleting = await checkBoxList(
        regexSelectedMessages,
        'delete'
      );
      response = {
        action: DELETE_MESSAGE,
        messages: messagesForDeleting
      };
    }
    return response;
  });
};

const checkBoxList = async (messages, action) => {
  let messagesListView = [];
  let returnMessages = [];

  messages.forEach(message => {
    messagesListView.push(message.MessageBody);
  });

  const question = {
    type: 'checkbox',
    name: 'selectedMessages',
    message: `Select one or more messages to ${action}`,
    choices: messagesListView
  };

  return await prompt([question]).then(answers => {
    answers.selectedMessages.forEach(selectedMessage => {
      messages.forEach(message => {
        if(selectedMessage = message.MessageBody)
      });
    });

    for (const m of answers.selectedMessages) {
      for (const b of messages) {
        if (m === b.MessageBody) {
          returnMessages.push(b);
        }
      }
    }
    return returnMessages;
  });
};

module.exports = {
  createQueuesArray,
  createDeleteArray,
  regexSelectMessage,
  promptForFurtherAction
};
