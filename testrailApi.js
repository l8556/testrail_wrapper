const TestRail = require('testrail-api');
const Config = require('./config');

class TestRailAPI {
    constructor(configPath) {
        const config = Config.loadConfig(configPath);
        this.testrail = new TestRail({
            host: config.url,
            user: config.user,
            password: config.password,
        });
    }

    async getProjectIdByName(name) {
        const projects = await this.getProjects();
        const project = projects.find(proj => proj.name === name);
        return project ? project.id : null
    }

    async getSuiteIdByName(projectId, suiteName) {
        const suites = await this.getSuites(projectId);
        const suite = suites.find(suite => suite.name === suiteName);
        return suite ? suite.id : null;
    }

    async getSectionIdByName(projectId, suiteId, sectionName) {
        const sections = await this.getSections(projectId, suiteId);
        const section = sections.find(sec => sec.name === sectionName);
        return section ? section.id : null;
    }

    async getPlanIdByName(projectId, planName) {
        const plans = await this.getPlans(projectId);
        const plan = plans.find(pln => pln.name === planName);
        return plan ? plan.id : null;
    }

    async getProjects() {
        return (await this.testrail.getProjects()).body;
    }

    async getSuites(projectId) {
        return (await this.testrail.getSuites(projectId)).body;
    }

    async getRuns(planId) {
        const response = await this.testrail.getPlan(planId);
        const entries = response.body.entries;
        let runs = [];
        entries.forEach(entry => {
            runs = runs.concat(entry.runs);
        });
        return runs;
    }

    async getRunIdByName(planId, runName) {
        const runs = await this.getRuns(planId);
        let run = runs.find(rn => rn.name === runName);
        return run ? run.id : null;
    }

    async getTestIdByName(runId, testName) {
        const tests = await this.getTests(runId);
        let test = tests.find(t => t.title === testName);
        return test ? test.id : null
    }

    async getPlans(projectId) {
        return (await this.testrail.getPlans(projectId)).body;
    }


    async getTests(runId) {
        return (await this.testrail.getTests(runId)).body;
    }

    async getSections(projectId, suiteId) {
        return (await this.testrail.getSections(projectId, { suite_id: suiteId })).body;
    }

    async createTestCase(sectionId, title, description) {
        return (await this.testrail.addCase(sectionId, {
            title: title,
            custom_steps: description
        })).body;
    }

    async createSection(projectId, suiteId, sectionTitle) {
        const section = await this.testrail.addSection(projectId, {
            suite_id: suiteId,
            name: sectionTitle
        });

        return section.body.id;
    }

    async createSuite(projectId, suiteName, description = 'Created automatically by script') {
        const suite = await this.testrail.addSuite(projectId, {
            name: suiteName,
            description: description
        });
        return suite.body.id;
    }

    async addResult(testId, result) {
        return (await this.testrail.addResult(testId, result)).body;
    }

    async addPlan(projectId, planName, description = 'Created automatically by script') {
        const plan = await this.testrail.addPlan(projectId, {
            name: planName,
            description: description
        });

        return plan.body.id;
    }

    async addPlanEntry(planId, entryData) {
        return (await this.testrail.addPlanEntry(planId, entryData)).body;
    }
}

module.exports = TestRailAPI;
