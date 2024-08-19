const TestRailClient = require('./TestRailClient');

// Создание клиента TestRail с конфигурацией по умолчанию
const testrailClient = new TestRailClient();

// Использование методов класса
testrailClient.getProjectIdByName('Test Project')
    .then(project => {
        console.log(project);
    })
    .catch(err => {
        console.error('Failed to fetch project by name:', err.message);
    });
