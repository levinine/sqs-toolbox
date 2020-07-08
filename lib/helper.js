const { prompt } = require('inquirer');
const {
    FURTHER_ACTION_QUESTION,
    MOVE_MESSAGE,
    DELETE_MESSAGE,
    TARGET_QUESTION
} = require('./const');

const { missingParameterPrint } = require('./print');

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
            const targetQueueName = await prompt(TARGET_QUESTION).then(
                answer => {
                    return answer.targetQueue;
                }
            );

            await checkBoxList(regexSelectedMessages, 'move').then(messages => {
                response = {
                    action: MOVE_MESSAGE,
                    messages: messages,
                    targetQueueName: targetQueueName
                };
            });
        } else if (answer.furtherAction === DELETE_MESSAGE) {
            await checkBoxList(regexSelectedMessages, 'delete').then(
                messages => {
                    response = {
                        action: DELETE_MESSAGE,
                        messages: messages
                    };
                }
            );
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
            for (const message of messages) {
                if (selectedMessage === message.MessageBody) {
                    returnMessages.push(message);
                    break;
                }
            }
        });
        return returnMessages;
    });
};

const getParameters = (action) => {
    let required = {}, optional = {}, requiredParameters = {}, optionalParameters = {};

    switch (action) {
    case 'list-queues':
        optional = { namePrefix: ['-np', '--namePrefix'] };
        break;
    case 'move':
        required = { sourceQueue: ['-sq', '--sourceQueue'], targetQueue: ['-tq', '--targetQueue'] };
        optional = { maxMessages: ['-mm', '--maxMessages'] };
        break;
    case 'peek':
        required = { queueName: ['-qn', '--queueName'] };
        optional = { maxMessages: ['-mm', '--maxMessages'] };
        break;
    case 'select':
        required = { queueName: ['-qn', '--queueName'] };
        optional ={ regularExpression: ['-re', '--regularExpression'] };
        break;
    case 'send':
        required = { queueName: ['-qn', '--queueName'], message: ['-mg', '--message'] };
        break;
    case 'create':
        required = { queueName: ['-qn', '--queueName'] };
        break;
    case 'delete':
        required = { queueName: ['-qn', '--queueName'] };
        break;
    default:
        console.log('ovde dodzem ne')
    }

    if (!required) {
        const namePrefix = process.argv.indexOf('-np') || process.argv.indexOf('--namePrefix');
        if (namePrefix > -1) {
            optionalParameters['namePrefix'] = process.argv[namePrefix + 1];
        }
    }

    for (let parameter in required) {
        const shortOption = process.argv.indexOf(required[parameter][0]);
        const longOption = process.argv.indexOf(required[parameter][1]);

        if( shortOption > -1 ) {
            requiredParameters[parameter] = process.argv[shortOption + 1];
        } else if (longOption > -1) {
            requiredParameters[parameter] = process.argv[longOption + 1];
        } else {
            missingParameterPrint(parameter, required[parameter]);
            process.exit();
        }
    }

    for (let parameter in optional) {
        const shortOption = process.argv.indexOf(optional[parameter][0]);
        const longOption = process.argv.indexOf(optional[parameter][1]);

        if( shortOption > -1 ) {
            optionalParameters[parameter] = process.argv[shortOption + 1];
        }
        if (longOption > -1) {
            optionalParameters[parameter] = process.argv[longOption + 1];
        }
    }

    return [requiredParameters, optionalParameters];
}

module.exports = {
    createQueuesArray,
    createDeleteArray,
    regexSelectMessage,
    promptForFurtherAction,
    getParameters
};
