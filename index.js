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
    const [source, target] = await Promise.all([
      API.listQueues(s),
      API.listQueues(t)
    ]).then(response => {
      return [response[0][0].url, response[1][0].url];
    });
    const [messages, entries] = await API.getMessages(source, maxMessages);
    await API.sendMessages(target, messages);
    if (entries.length > 0) {
      await API.deleteMessages(source, entries);
    }
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
