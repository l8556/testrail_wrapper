const TestRailClient = require('./TestRailClient');


const testrailClient = new TestRailClient();

// async function main() {
//     try {
//         const projectName = 'Test Project';
//         const planName = '8.2.0 (build:27)';
//         const runName = 'All Values of Image Formats';
//         const suiteName = 'All Values of Image Formats';

//         // Получаем ID проекта
//         const projectId = await testrailClient.getProjectIdByName(projectName);
//         console.log(`Project ID: ${projectId}`);

//         // Получаем или создаем план
//         const planId = await testrailClient.getPlanIdByName(projectId, planName);
//         console.log(`Plan ID: ${planId}`);

//         // Получаем или создаем набор тестов (suite)
//         const suiteId = await testrailClient.getSuiteIdByName(projectId, suiteName);
//         console.log(`Suite ID: ${suiteId}`);

//         // Получаем или создаем тестовый прогон (run)
//         const runId = await testrailClient.getRunIdByName(planId, runName, suiteId);
//         console.log(`Run ID: ${runId}`);

//         // Пример результатов тестов
//         const results = [
//             {
//                 case_id: 1, // Идентификатор тест-кейса должен быть действительным
//                 status_id: 1, // Статус теста (например, 1 - Passed)
//                 comment: 'Test passed successfully'
//             },
//             {
//                 case_id: 2, // Другой тест-кейс
//                 status_id: 5, // Статус теста (например, 5 - Failed)
//                 comment: 'Test failed due to error'
//             }
//         ];

//         // Добавляем результаты тестов в прогон
//         await testrailClient.addResultsForCases(runId, results);

//         console.log('Test results added successfully.');
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

const result = {
    status_id: 1, // Passed
    comment: "Test passed successfully"
};

testrailClient.addResultToCase(
    "Test Project",
    "8.2.0 (build:28)",
    "All Values of Image Formats",
    "Check supported <bmp> Image Format",
    result
);


// main();
