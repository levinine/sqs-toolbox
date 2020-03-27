const Conf = require('conf');
const config = new Conf();
const { AWS_REGION } = require('./const');
const { output } = require('./print');
const print = output();

const setRegion = region => {
  config.set(AWS_REGION, region);
  print.regionSet(region);
};

const getRegion = () => {
  return config.get(AWS_REGION);
};

module.exports = {
  setRegion,
  getRegion
};
