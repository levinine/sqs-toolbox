const Conf = require('conf');
const config = new Conf();
const { AWS_REGION } = require('./const');
const { regionSetMessage } = require('./messages');

const setRegion = region => {
  config.set(AWS_REGION, region);
  regionSetMessage(region);
};

const getRegion = () => {
  return config.get(AWS_REGION);
};

module.exports = {
  setRegion,
  getRegion
};
