const Conf = require('conf');
const config = new Conf({ projectName: 'sqs-toolbox' });
const { AWS_REGION } = require('./const');
const { regionSetPrint } = require('./print');

const setRegion = (region) => {
    config.set(AWS_REGION, region);
    regionSetPrint(region);
};

const getRegion = () => {
    return config.get(AWS_REGION);
};

module.exports = {
    setRegion,
    getRegion,
};
