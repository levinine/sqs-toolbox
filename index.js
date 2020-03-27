const aws = require('aws-sdk');
const { program } = require('commander');
const { initializeRegion } = require('./region');
const { figletMessage } = require('./messages');
const { queuesAPI } = require('./queues');

figletMessage();

//justfortesting
// const Conf = require('conf');
// const config = new Conf();
// config.delete('region');

const createSQS = async () => {
  await initializeRegion();
  const sqs = new aws.SQS();
  return sqs;
};

const moveMessage = async (source, target) => {
  console.log(`Moving message from ${source} to ${target}`);
};

const listQueues = async namePrefix => {
  const sqs = await createSQS();
  return await queuesAPI(namePrefix, sqs);
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
