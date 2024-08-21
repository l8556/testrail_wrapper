
class TestManager {
    constructor(api) {
        this.api = api;
        this.cache = {
            projectIds: new Map(),
            suites: new Map(),
            plans: new Map(),
            runs: new Map(),
            tests: new Map(),
            sections: new Map()
        };
    }

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
