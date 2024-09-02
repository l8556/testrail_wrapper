const TestRailAPI = require('./testrailApi');
const TestManager = require('./testManager');

const api = new TestRailAPI();
const testManager = new TestManager(api);

module.exports = {
    api,
    testManager
};
