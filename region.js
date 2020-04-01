const aws = require('aws-sdk');
const { exec } = require('child_process');
const { prompt } = require('inquirer');
const { setRegion, getRegion } = require('./conf');
const { output } = require('./print');
const print = output();
const regex = RegExp(
  '(us|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\\d'
);

const checkRegion = region => {
  if (regex.test(region)) {
    return true;
  } else {
    print.regionFormatError(region);
  }
};

const getRegionFromArgs = () => {
  const regionInArgs =
    process.argv.indexOf('-r') || process.argv.indexOf('--region');
  if (regionInArgs > -1) {
    return process.argv[regionInArgs + 1];
  }
};

const regionInput = async () => {
  const question = {
    type: 'input',
    name: 'region',
    message: 'Please enter your region:',
    validate: checkRegion,
    default: 'eu-central-1'
  };
  const region = prompt([question])
    .then(answer => {
      return answer.region;
    })
    .catch(error => {
      console.log(error);
    });
  return region;
};

const promptForRegion = async () => {
  return new Promise(resolve => {
    exec('aws configure get region', (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(regionInput());
      } else {
        resolve(stdout);
      }
    });
  });
};

const initializeRegion = async () => {
  let region = getRegionFromArgs();
  if (region) {
    if (!checkRegion(region)) {
      process.exit();
    }
    setRegion(region);
  } else if (!region && !getRegion()) {
    // region is not passed in the args and we do not have it assinged
    await setRegion(await promptForRegion());
    region = getRegion();
  } else if (!region) {
    // region is not passed in the args but we have it assinged
    region = getRegion();
  }

  aws.config.update({ region });
  return new aws.SQS();
};

module.exports = {
  promptForRegion,
  checkRegion,
  getRegionFromArgs,
  initializeRegion
};
