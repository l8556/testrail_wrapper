# TestRail Wrapper

TestRail Wrapper is a tool for interacting with the
TestRail API which provides a set of methods for managing
projects, sets, sections, plans, runs and test cases in TestRail.

## Install the dependencies

```bash
npm install
```

## Configuration

Create a configuration file `~/.testrail/testrail_config.json`.
The configuration file should include the following fields:

```json
{
  "url": "https://your-testrail-instance-url",
  "user": "your-username",
  "password": "your-password"
}
```

## Example Usage

Add a Result to a Test Case

```javascript
const { testManager } = require('./index');

const result = {
    status_id: 1, // Passed
    comment: "Test passed successfully."
};

testManager.addResultToCase(
    "Test Project", // Project name
    "8.2.0 (build:34)", // Plan name
    "All Values of Image Formats", // Suite name
    "Check supported <bmp> Image Format", // Test case name
    result
)
    .then(() => console.log('Test result added successfully.'))
    .catch(err => console.error('Error adding test result:', err));
```
