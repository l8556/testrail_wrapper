
class TestManager {
    /**
     * Creates an instance of TestManager.
     * @param {Object} api - An instance of the API client to interact with the test management system.
     */
    constructor(api) {
        /**
         * The API client instance used for making requests.
         * @type {Object}
         */
        this.api = api;

        /**
         * A cache to store IDs for projects, suites, plans, runs, tests, and sections to reduce API calls.
         * @type {Object}
         * @property {Map} projectIds - Cache for project IDs by project name.
         * @property {Map} suites - Cache for suite IDs by project ID and suite name.
         * @property {Map} plans - Cache for plan IDs by project ID and plan name.
         * @property {Map} runs - Cache for run IDs by plan ID and run name.
         * @property {Map} tests - Cache for test IDs by run ID and test name.
         * @property {Map} sections - Cache for section IDs by project ID, suite ID, and section title.
         */
        this.cache = {
            projectIds: new Map(),
            suites: new Map(),
            plans: new Map(),
            runs: new Map(),
            tests: new Map(),
            sections: new Map()
        };
    }

    /**
     * Retrieves the project ID by its name. Caches the result for future use.
     * @param {string} name - The name of the project.
     * @returns {Promise<number|null>} - The project ID or null if not found.
     */
    async getProjectIdByName(name) {
    if (!this.cache.projectIds.has(name)) {
        const projectId = await this.api.getProjectIdByName(name);

        if (!projectId) {
            console.error(`Project with name "${name}" not found.`);
            return null;
        }

        this.cache.projectIds.set(name, projectId);
        }

    return this.cache.projectIds.get(name);
    }

    /**
     * Retrieves or creates a suite ID by its name. Caches the result for future use.
     * @param {number} projectId - The ID of the project.
     * @param {string} suiteName - The name of the suite.
     * @returns {Promise<number>} - The suite ID.
     */
    async getOrCreateSuiteIdByName(projectId, suiteName) {
        const cacheKey = `${projectId}_${suiteName}`;
        if (this.cache.suites.has(cacheKey)) {
            return this.cache.suites.get(cacheKey);
        }

        const suiteId = await this.api.getSuiteIdByName(projectId, suiteName)
            || await this.api.createSuite(projectId, suiteName);

        this.cache.suites.set(cacheKey, suiteId);
        return suiteId;
    }

    /**
     * Retrieves or creates a plan ID by its name. Caches the result for future use.
     * @param {number} projectId - The ID of the project.
     * @param {string} planName - The name of the plan.
     * @returns {Promise<number>} - The plan ID.
     */
    async getOrCreatePlanIdByName(projectId, planName) {
        const cacheKey = `${projectId}_${planName}`;
        if (this.cache.plans.has(cacheKey)) {
            return this.cache.plans.get(cacheKey);
        }

        const planId = await this.api.getPlanIdByName(projectId, planName)
            || await this.api.addPlan(projectId, planName);

        this.cache.plans.set(cacheKey, planId);
        return planId
    }

    /**
     * Retrieves or creates a run ID by its name. Caches the result for future use.
     * @param {number} planId - The ID of the plan.
     * @param {string} runName - The name of the run.
     * @param {number} suiteId - The ID of the suite.
     * @returns {Promise<number>} - The run ID.
     */
    async getOrCreateRunIdByName(planId, runName, suiteId) {
        const cacheKey = `${planId}_${runName}`;
        if (this.cache.runs.has(cacheKey)) {
            return this.cache.runs.get(cacheKey);
        }

        let runId = await this.api.getRunIdByName(planId, runName)

        if (!runId) {
            const newRun = await this.api.addPlanEntry(planId, {
                name: runName,
                suite_id: suiteId,
                include_all: true,
                description: 'Created automatically by script'
            });
            runId = newRun.runs[0].id;
        }

        this.cache.runs.set(cacheKey, runId);
        return runId;
    }

    /**
     * Retrieves or creates a test ID by its name. Caches the result for future use.
     * @param {number} runId - The ID of the run.
     * @param {string} testName - The name of the test.
     * @param {number} projectId - The ID of the project.
     * @param {number} suiteId - The ID of the suite.
     * @param {string} sectionTitle - The title of the section.
     * @returns {Promise<number>} - The test ID.
     */
    async getOrCreateTestIdByName(runId, testName, projectId, suiteId, sectionTitle) {
        const cacheKey = `${runId}_${testName}`;
        if (this.cache.tests.has(cacheKey)) {
            return this.cache.tests.get(cacheKey);
        }

        let testId = await this.api.getTestIdByName(runId, testName)

        if (!testId) {
            const sectionId = await this.getOrCreateSectionIdByName(projectId, suiteId, sectionTitle);
            await this.api.createTestCase(sectionId, testName, testName);
            testId = await this.api.getTestIdByName(runId, testName);
            if (!testId) {
                console.log("Can't get testId");
            }
        }

        this.cache.tests.set(cacheKey, testId);
        return testId;
    }

    /**
     * Retrieves or creates a section ID by its title. Caches the result for future use.
     * @param {number} projectId - The ID of the project.
     * @param {number} suiteId - The ID of the suite.
     * @param {string} sectionTitle - The title of the section.
     * @returns {Promise<number>} - The section ID.
     */
    async getOrCreateSectionIdByName(projectId, suiteId, sectionTitle) {
        const cacheKey = `${projectId}_${suiteId}_${sectionTitle}`;
        if (this.cache.sections.has(cacheKey)) {
            return this.cache.sections.get(cacheKey);
        }

        const sectionId = await this.api.getSectionIdByName(projectId, suiteId, sectionTitle)
        || await this.api.createSection(projectId, suiteId, sectionTitle)

        this.cache.sections.set(cacheKey, sectionId);

        return sectionId;
    }

    /**
     * Adds a test result to a test case in a specific run, creating necessary entities if they do not exist.
     * @param {string} projectName - The name of the project.
     * @param {string} planName - The name of the plan.
     * @param {string} suiteName - The name of the suite.
     * @param {string} caseTitle - The title of the test case.
     * @param {Object} result - The result to be added.
     * @param {string} [sectionTitle='All Test Cases'] - The title of the section where the test case is located.
     * @returns {Promise<void>}
     */
    async addResultToCase(projectName, planName, suiteName, caseTitle, result, sectionTitle = 'All Test Cases') {
        const projectId = await this.getProjectIdByName(projectName);
        const planId = await this.getOrCreatePlanIdByName(projectId, planName);
        const suiteId = await this.getOrCreateSuiteIdByName(projectId, suiteName);
        const runId = await this.getOrCreateRunIdByName(planId, suiteName, suiteId);
        const testId = await this.getOrCreateTestIdByName(runId, caseTitle, projectId, suiteId, sectionTitle);

        await this.api.addResult(testId, result);
    }
}

module.exports = TestManager;
