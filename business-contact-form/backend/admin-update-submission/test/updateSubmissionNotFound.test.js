const assert = require('assert');
const path = require('path');

// Ensure our aws-sdk stub is used
process.env.NODE_PATH = path.resolve(__dirname);
require('module').Module._initPaths();

process.env.SUBMISSIONS_TABLE = 'submissions-table';

const { lambdaHandler } = require('../app');

(async () => {
  const event = {
    pathParameters: { id: 'test-id' },
    queryStringParameters: { timestamp: '1234567890' },
    body: JSON.stringify({ status: 'viewed' })
  };

  const response = await lambdaHandler(event, {});
  assert.strictEqual(response.statusCode, 404, 'Expected 404 when submission not found');
  const body = JSON.parse(response.body);
  assert.strictEqual(body.message, 'Submission not found', 'Expected not found message');
  console.log('updateSubmission not found test passed');
})();
