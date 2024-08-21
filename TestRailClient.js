// testrailClient.js
const TestRail = require('testrail-api');
const fs = require('fs');
const path = require('path');


class TestRailClient {
    constructor(configPath = '~/.testrail/testrail_config.json') {
        const config = this._readConfig(configPath);
        this.testrail = new TestRail({
            host: config.url,
            user: config.user,
            password: config.key,
        });
    }

    _readConfig(configPath) {
        try {
            const resolvedPath = configPath.replace('~', process.env.HOME || process.env.USERPROFILE);
            const configData = fs.readFileSync(path.resolve(resolvedPath), 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error(`Failed to read config file from ${configPath}:`, error.message);
            throw error;
        }
    }

    async getProjects() {
        try {
            return (await this.testrail.getProjects()).body;
        } catch (error) {
            console.error('Error fetching projects:', error.message);
            throw error;
        }
    }

    async getSuites(projectId) {
        try {
            const response = await this.testrail.getSuites(projectId);
            return response.body;
        } catch (error) {
            console.error('Error fetching suites:', error.message);
            throw error;
        }
    }

    async getSuiteIdByName(projectId, suiteName) {
        try {
            const suites = await this.getSuites(projectId);
            const suite = suites.find(suite => suite.name === suiteName);
            if (suite) {
                return suite.id;
            } else {
                return await this.createSuite(projectId, suiteName);
            }
        } catch (error) {
            console.error('Error fetching suite ID by name:', error.message);
            throw error;
        }
    }

    async getRuns(planId) {
        try {
            const response = await this.testrail.getPlan(planId);
            const entries = response.body.entries;
            let runs = [];
            entries.forEach(entry => {
                runs = runs.concat(entry.runs);
            });
            return runs; // Получаем все прогоны из всех записей плана
        } catch (error) {
            console.error('Error fetching runs:', error.message);
            throw error;
        }
    }

    async getRunIdByName(planId, runName, suiteId) {
        try {
            const runs = await this.getRuns(planId);
            const run = runs.find(rn => rn.name === runName);
            if (run) {
                return run.id;
            } else {
                return await this.createRun(planId, runName, suiteId);
            }
        } catch (error) {
            console.error('Error fetching run ID by name:', error.message);
            throw error;
        }
    }

    async addResultsForCases(runId, results) {
        try {
            const response = await this.testrail.addResultsForCases(runId, {
                results
            });
            return response.body;
        } catch (error) {
            console.error('Error adding results for cases:', error.message);
            throw error;
        }
    }

    async createRun(planId, runName, suiteId) {
        try {
            const response = await this.testrail.addPlanEntry(planId, {
                name: runName,
                suite_id: suiteId,
                include_all: true,
                description: 'Created automatically by script'
            });
            return response.body.runs[0].id;
        } catch (error) {
            console.error('Error creating run:', error.message);
            throw error;
        }
    }

    async addCase(sectionId, testCase) {
        try {
            return await this.testrail.addCase(sectionId, testCase);
        } catch (error) {
            console.error('Error adding test case:', error.message);
            throw error;
        }
    }

    async addResult(testId, result) {
        try {
            return await this.testrail.addResult(testId, result);
        } catch (error) {
            console.error('Error adding test result:', error.message);
            throw error;
        }
    }

    async addRun(projectId, run) {
        try {
            return await this.testrail.addRun(projectId, run);
        } catch (error) {
            console.error('Error creating test run:', error.message);
            throw error;
        }
    }

    async getResultsForRun(runId) {
        try {
            return await this.testrail.getResultsForRun(runId);
        } catch (error) {
            console.error('Error fetching test results:', error.message);
            throw error;
        }
    }

    async getProjectByName(name) {
        try {
            const projects = await this.getProjects();

            if (!Array.isArray(projects)) {
                throw new Error('Expected an array but received something else');
            }

            const project = projects.find(proj => proj.name === name);

            if (project) {
                return project;
            } else {
                throw new Error(`Project with name "${name}" not found.`);
            }
        } catch (error) {
            console.error('Error fetching project by name:', error.message);
            throw error;
        }
    }

    async createSuite(projectId, suiteName) {
        try {
            const response = await this.api.addSuite(projectId, {
                name: suiteName,
                description: 'Created automatically by script'
            });
            return response.body.id;
        } catch (error) {
            console.error('Error creating suite:', error.message);
            throw error;
        }
    }

    async createTestRun(projectId, suiteId, planId) {
        try {
            const response = await this.testrail.addRun(projectId, {
                name: `Test Run for Plan ${planId}`,
                suite_id: suiteId,
                plan_id: planId,
                description: 'Created automatically by script'
            });
            return response.id; // Возвращаем только ID созданного прогона
        } catch (error) {
            console.error('Error creating test run:', error.message);
            throw error;
        }
    }

    async createPlan(projectId, planName) {
        try {
            const response = await this.testrail.addPlan(projectId, {
                name: planName,
                description: 'Created automatically by script'
            });
            return response.id; // Возвращаем только ID созданного плана
        } catch (error) {
            console.error('Error creating plan:', error.message);
            throw error;
        }
    }

    async getPlanIdByName(projectId, planName) {
        try {
            const plans = await this.testrail.getPlans(projectId);
            const plan = plans.body.find(pln => pln.name === planName);
            if (plan) {
                return plan.id;
            } else {
                plan = await this.testrail.addPlan(projectId, { name: planName });
                return plan.id
            }
        } catch (error) {
            console.error('Error fetching plan ID by name:', error.message);
            throw error;
        }
    }

    async getProjectIdByName(name) {
        try {
            const projects = await this.getProjects();

            if (!Array.isArray(projects)) {
                throw new Error('Expected an array but received something else');
            }

            const project = projects.find(proj => proj.name === name);

            if (project) {
                return project.id;
            } else {
                throw new Error(`Project with name "${name}" not found.`);
            }
        } catch (error) {
            console.error('Error fetching project by name:', error.message);
            throw error;
        }
    }

    async getTests(runId) {
        try {
            const response = await this.testrail.getTests(runId);
            console.log('Retrieved tests:', response.body);
            return response.body;
        } catch (error) {
            console.error('Error fetching tests:', error);
            return [];
        }
    }

    async getTestIdByName(runId, testName) {
        try {
            const tests = this.getTests(runId);
            const test = tests.find(t => t.title === testName);

            if (test) {
            console.log(`Found test "${testName}" with ID: ${test.id}`);
            return test.id;
            } else {
            console.log(`Test with name "${testName}" not found.`);
            return null;
            }

        } catch (error) {
            console.error('Error fetching tests:', error);
            return [];
        }
    }

    async addResultToCase(projectName, planName, suiteName, caseTitle, result) {
        try {
            const projectId = await this.getProjectIdByName(projectName);
            const planId = await this.getPlanIdByName(projectId, planName);
            const suiteId = await this.getSuiteIdByName(projectId, suiteName);

            const runId = await this.getRunIdByName(planId, suiteName, suiteId);
            console.log(projectId)
            // const caseId = await this.testrail.getCases(projectId)

            // console.log(caseId)
            // const caseId = await this.getOrCreateCase(projectId, runId, caseTitle);

            const response = await this.testrail.getTests(2607225)
            console.log('Retrieved tests:', response.body);


            const results = [{
                status_id: 1,
                comment: "Test passed successfully",
            }];



            // await this.testrail.addResult(139449670, {
            //     status_id: 1,
            //     comment: "Test passed 44successfully",
            //     suite_id: suiteId
            // }
            // )
            console.log(5)

        } catch (error) {
            console.error('Error adding results for case:', error.message);
        }
    }
}


module.exports = TestRailClient;
