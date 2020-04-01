const { program } = require('commander');
const { output } = require('./print');
const print = output();
const { createAPI } = require('./api');

print.figletPrint();

// // justfortesting;
// const Conf = require('conf');
// const config = new Conf();
// config.delete('region');

const moveMessages = async (s, t, maxMessages) => {
  try {
    const API = await createAPI();
    const messages = await API.getMessages(s, maxMessages);
    await API.sendMessages(t, messages);
    // await API.deleteMessages();
    return messages;
  } catch (error) {
    console.log(error);
  }
};

const listQueues = async namePrefix => {
  try {
    const API = await createAPI();
    const sqsQueues = await API.listQueues(namePrefix);
    print.queuesTable(sqsQueues);
    return sqsQueues;
  } catch (error) {
    console.log(error);
  }
};

program
  .command('list-queues [namePrefix]')
  .description('List all queues')
  .action(listQueues);

program
  .command('move <source> <destination> [maxMessages]')
  .description('Move a message from one queue to another')
  .action(moveMessages);

program.option('-r, --region <regionName>', 'Set region');

program.parse(process.argv);
