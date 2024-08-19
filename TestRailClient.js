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
            return await this.testrail.getSuites(projectId);
        } catch (error) {
            console.error('Error fetching test suites:', error.message);
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
}


module.exports = TestRailClient;
