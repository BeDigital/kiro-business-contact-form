const AWS = require('aws-sdk');

// Check if we're running locally
const isLocal = process.env.AWS_SAM_LOCAL === 'true';

// Initialize AWS services
const dynamodbOptions = isLocal ? {
  endpoint: 'http://dynamodb-local:8000',
  region: 'us-east-1'
} : {};
const dynamodb = new AWS.DynamoDB.DocumentClient(dynamodbOptions);

// Environment variables
const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE;

/**
 * Updates a form submission in DynamoDB
 * @param {string} id - The submission ID
 * @param {Object} updates - The fields to update
 * @returns {Promise} - Promise resolving to the updated item
 */
const updateSubmission = async (id, timestamp, updates) => {
  // Only allow updating the status field
  if (!updates.status) {
    throw new Error('Status field is required for updates');
  }
  
  // Validate status value
  const validStatuses = ['new', 'viewed', 'responded', 'completed', 'spam'];
  if (!validStatuses.includes(updates.status)) {
    throw new Error('Invalid status value');
  }
  
  const params = {
    TableName: SUBMISSIONS_TABLE,
    Key: {
      id,
      timestamp
    },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': updates.status
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamodb.update(params).promise();
  return result.Attributes;
};

/**
 * Lambda handler for updating form submissions
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // Get submission ID from path parameters
    const id = event.pathParameters.id;
    
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Get timestamp from query parameters (required for composite key)
    const timestamp = event.queryStringParameters?.timestamp;
    if (!timestamp) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://thunk-it.com'
        },
        body: JSON.stringify({
          message: 'Timestamp query parameter is required'
        })
      };
    }
    
    // Update submission
    const updatedSubmission = await updateSubmission(id, timestamp, body);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://thunk-it.com'
      },
      body: JSON.stringify({
        message: 'Submission updated successfully',
        submission: updatedSubmission
      })
    };
  } catch (error) {
    console.error('Error updating submission:', error);
    
    // Return error response
    return {
      statusCode: error.message.includes('required') || error.message.includes('Invalid') ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://thunk-it.com'
      },
      body: JSON.stringify({
        message: error.message || 'Internal server error'
      })
    };
  }
};