const fs = require('fs');
const path = require('path');

/**
 * A utility class for loading configuration files.
 */
class Config {
    /**
     * Loads and parses a configuration file from the specified path.
     * @param {string} [configPath='~/.testrail/testrail_config.json'] - The path to the configuration file. Defaults to '~/.testrail/testrail_config.json'.
     * @returns {Object} - The parsed configuration object.
     * @throws {Error} - Throws an error if the configuration file cannot be read or parsed.
     */
    static loadConfig(configPath = '~/.testrail/testrail_config.json') {
        try {
            const resolvedPath = configPath.replace('~', process.env.HOME || process.env.USERPROFILE);
            const configData = fs.readFileSync(path.resolve(resolvedPath), 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error(`Failed to read config file from ${configPath}:`, error.message);
            throw error;
        }
    }
}

module.exports = Config;
