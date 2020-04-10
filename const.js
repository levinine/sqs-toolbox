const AWS_REGION = 'region';
const PULL = 'pull';
const SEND = 'send';
const DELETE = 'delete';
const MOVE_MESSAGE = 'Move message';
const DELETE_MESSAGE = 'Delete message';
const FURTHER_ACTION_QUESTION = [
  {
    type: 'rawlist',
    name: 'furtherAction',
    message: 'Would you like to continue?',
    choices: ['Move message', 'Delete message', 'Exit'],
  },
];
const TARGET_QUESTION = [
  {
    type: 'input',
    name: 'targetQueue',
    message: 'Enter the name of destination queue',
  },
];
module.exports = {
  AWS_REGION,
  PULL,
  SEND,
  DELETE,
  MOVE_MESSAGE,
  DELETE_MESSAGE,
  FURTHER_ACTION_QUESTION,
  TARGET_QUESTION,
};
