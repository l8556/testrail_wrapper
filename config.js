const fs = require('fs');
const path = require('path');

class Config {
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
