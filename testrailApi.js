const TestRail = require('testrail-api');
const Config = require('./config');

class TestRailAPI {
    /**
     * Initializes the TestRailAPI instance with configuration details.
     * @param {string} configPath - Path to the configuration file.
     */
    constructor(configPath) {
        const config = Config.loadConfig(configPath);
        this.testrail = new TestRail({
            host: config.url,
            user: config.user,
            password: config.password,
        });
    }

    /**
     * Retrieves the ID of a project by its name.
     * @param {string} name - The name of the project.
     * @returns {Promise<number|null>} - The ID of the project, or null if not found.
     */
    async getProjectIdByName(name) {
        const projects = await this.getProjects();
        const project = projects.find(proj => proj.name === name);
        return project ? project.id : null
    }

    /**
     * Retrieves the ID of a suite by its name within a given project.
     * @param {number} projectId - The ID of the project.
     * @param {string} suiteName - The name of the suite.
     * @returns {Promise<number|null>} - The ID of the suite, or null if not found.
     */
    async getSuiteIdByName(projectId, suiteName) {
        const suites = await this.getSuites(projectId);
        const suite = suites.find(suite => suite.name === suiteName);
        return suite ? suite.id : null;
    }

    /**
     * Retrieves the ID of a section by its name within a given project and suite.
     * @param {number} projectId - The ID of the project.
     * @param {number} suiteId - The ID of the suite.
     * @param {string} sectionName - The name of the section.
     * @returns {Promise<number|null>} - The ID of the section, or null if not found.
     */
    async getSectionIdByName(projectId, suiteId, sectionName) {
        const sections = await this.getSections(projectId, suiteId);
        const section = sections.find(sec => sec.name === sectionName);
        return section ? section.id : null;
    }

    /**
     * Retrieves the ID of a plan by its name within a given project.
     * @param {number} projectId - The ID of the project.
     * @param {string} planName - The name of the plan.
     * @returns {Promise<number|null>} - The ID of the plan, or null if not found.
     */
    async getPlanIdByName(projectId, planName) {
        const plans = await this.getPlans(projectId);
        const plan = plans.find(pln => pln.name === planName);
        return plan ? plan.id : null;
    }

    /**
     * Retrieves all projects from TestRail.
     * @returns {Promise<Array>} - A list of all projects.
     */
    async getProjects() {
        return (await this.testrail.getProjects()).body;
    }

    /**
     * Retrieves all suites for a given project.
     * @param {number} projectId - The ID of the project.
     * @returns {Promise<Array>} - A list of all suites for the project.
     */
    async getSuites(projectId) {
        return (await this.testrail.getSuites(projectId)).body;
    }

    /**
     * Retrieves all runs associated with a given plan.
     * @param {number} planId - The ID of the plan.
     * @returns {Promise<Array>} - A list of runs associated with the plan.
     */
    async getRuns(planId) {
        const response = await this.testrail.getPlan(planId);
        const entries = response.body.entries;
        let runs = [];
        entries.forEach(entry => {
            runs = runs.concat(entry.runs);
        });
        return runs;
    }

    /**
     * Retrieves the ID of a run by its name within a given plan.
     * @param {number} planId - The ID of the plan.
     * @param {string} runName - The name of the run.
     * @returns {Promise<number|null>} - The ID of the run, or null if not found.
     */
    async getRunIdByName(planId, runName) {
        const runs = await this.getRuns(planId);
        let run = runs.find(rn => rn.name === runName);
        return run ? run.id : null;
    }

    /**
     * Retrieves the ID of a test by its name within a given run.
     * @param {number} runId - The ID of the run.
     * @param {string} testName - The name of the test.
     * @returns {Promise<number|null>} - The ID of the test, or null if not found.
     */
    async getTestIdByName(runId, testName) {
        const tests = await this.getTests(runId);
        let test = tests.find(t => t.title === testName);
        return test ? test.id : null
    }

    /**
     * Retrieves all plans for a given project.
     * @param {number} projectId - The ID of the project.
     * @returns {Promise<Array>} - A list of all plans for the project.
     */
    async getPlans(projectId) {
        return (await this.testrail.getPlans(projectId)).body;
    }


    /**
     * Retrieves all tests associated with a given run.
     * @param {number} runId - The ID of the run.
     * @returns {Promise<Array>} - A list of all tests associated with the run.
     */
    async getTests(runId) {
        return (await this.testrail.getTests(runId)).body;
    }

    /**
     * Retrieves all sections for a given project and suite.
     * @param {number} projectId - The ID of the project.
     * @param {number} suiteId - The ID of the suite.
     * @returns {Promise<Array>} - A list of all sections for the suite.
     */
    async getSections(projectId, suiteId) {
        return (await this.testrail.getSections(projectId, { suite_id: suiteId })).body;
    }

    /**
     * Creates a new test case within a given section.
     * @param {number} sectionId - The ID of the section.
     * @param {string} title - The title of the test case.
     * @param {string} description - The description of the test case.
     * @returns {Promise<Object>} - The created test case object.
     */
    async createTestCase(sectionId, title, description) {
        return (await this.testrail.addCase(sectionId, {
            title: title,
            custom_steps: description
        })).body;
    }

    /**
     * Creates a new section within a given suite and project.
     * @param {number} projectId - The ID of the project.
     * @param {number} suiteId - The ID of the suite.
     * @param {string} sectionTitle - The title of the new section.
     * @returns {Promise<number>} - The ID of the created section.
     */
    async createSection(projectId, suiteId, sectionTitle) {
        const section = await this.testrail.addSection(projectId, {
            suite_id: suiteId,
            name: sectionTitle
        });

        return section.body.id;
    }

    /**
     * Creates a new suite within a given project.
     * @param {number} projectId - The ID of the project.
     * @param {string} suiteName - The name of the new suite.
     * @param {string} [description='Created automatically by script'] - The description of the suite.
     * @returns {Promise<number>} - The ID of the created suite.
     */
    async createSuite(projectId, suiteName, description = 'Created automatically by script') {
        const suite = await this.testrail.addSuite(projectId, {
            name: suiteName,
            description: description
        });
        return suite.body.id;
    }

    /**
     * Adds a result to a test case.
     * @param {number} testId - The ID of the test case.
     * @param {Object} result - The result object containing status and other details.
     * @returns {Promise<Object>} - The result object from TestRail.
     */
    async addResult(testId, result) {
        return (await this.testrail.addResult(testId, result)).body;
    }

    /**
     * Creates a new plan within a given project.
     * @param {number} projectId - The ID of the project.
     * @param {string} planName - The name of the new plan.
     * @param {string} [description='Created automatically by script'] - The description of the plan.
     * @returns {Promise<number>} - The ID of the created plan.
     */
    async addPlan(projectId, planName, description = 'Created automatically by script') {
        const plan = await this.testrail.addPlan(projectId, {
            name: planName,
            description: description
        });

        return plan.body.id;
    }

    /**
     * Adds an entry to a plan.
     * @param {number} planId - The ID of the plan.
     * @param {Object} entryData - The data for the new plan entry.
     * @returns {Promise<Object>} - The created plan entry object.
     */
    async addPlanEntry(planId, entryData) {
        return (await this.testrail.addPlanEntry(planId, entryData)).body;
    }
}

module.exports = TestRailAPI;
