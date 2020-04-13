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
  selectedMessages.forEach(selectedMessage => {
    deleteMessages.forEach(deleteMessage => {
      if (selectedMessage.Id === deleteMessage.Id) {
        deleteMessagesArray.push(deleteMessage);
      }
    });
  });
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

  messages.forEach(message => {
    if (regex.test(message.MessageBody)) {
      matchedMessages.push(message);
    }
  });

  return matchedMessages;
};

const promptForFurtherAction = async regexSelectedMessages => {
  return await prompt(FURTHER_ACTION_QUESTION).then(async answer => {
    let response = {};

    if (answer.furtherAction === MOVE_MESSAGE) {
      const targetQueueName = await prompt(TARGET_QUESTION).then(answer => {
        return answer.targetQueue;
      });

      await checkBoxList(regexSelectedMessages, 'move').then(messages => {
        response = {
          action: MOVE_MESSAGE,
          messages: messages,
          targetQueueName: targetQueueName
        };
      });
    } else if (answer.furtherAction === DELETE_MESSAGE) {
      await checkBoxList(regexSelectedMessages, 'delete').then(messages => {
        response = {
          action: DELETE_MESSAGE,
          messages: messages
        };
      });
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
        if (selectedMessage === message.MessageBody) {
          returnMessages.push(message);
        }
      });
    });
    return returnMessages;
  });
};

module.exports = {
  createQueuesArray,
  createDeleteArray,
  regexSelectMessage,
  promptForFurtherAction
};
