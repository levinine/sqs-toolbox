const aws = require('aws-sdk');
const { program } = require('commander');
const { initializeRegion } = require('./region');
const { output } = require('./print');
const print = output();
const { apiFunctions } = require('./api');
const API = apiFunctions();

print.figletPrint();

// // justfortesting;
// const Conf = require('conf');
// const config = new Conf();
// config.delete('region');

const createSQS = async () => {
  await initializeRegion();
  const sqs = new aws.SQS();
  return sqs;
};

const moveMessage = async (s, t) => {
  print.movingMessages(s, t);
  try {
    const sqs = await createSQS();
    const source = await API.listQueues(s, sqs);

    const target = await API.listQueues(t, sqs);
    console.log(await API.getMessages(source, target, sqs));
  } catch (error) {
    console.log(error);
  }
};

const listQueues = async namePrefix => {
  const sqs = await createSQS();
  const sqsQueues = await API.listQueues(namePrefix, sqs);
  print.queuesTable(sqsQueues);
  return sqsQueues;
};

program
  .command('list-queues [namePrefix]')
  .description('List all queues')
  .action(listQueues);

program
  .command('move <source> <destination>')
  .description('Move a message from one queue to another')
  .action(moveMessage);

program.option('-r, --region <regionName>', 'Set region');

program.parse(process.argv);
