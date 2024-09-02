const TestRailAPI = require('./src/testrailApi');
const TestManager = require('./src/testManager');

const api = new TestRailAPI();
const testManager = new TestManager(api);

module.exports = {
    api,
    testManager
};
