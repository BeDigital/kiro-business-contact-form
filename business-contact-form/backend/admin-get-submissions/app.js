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
 * Retrieves form submissions from DynamoDB
 * @param {Object} queryParams - Query parameters for filtering
 * @returns {Promise} - Promise resolving to the submissions
 */
const getSubmissions = async (queryParams) => {
  const { status, startDate, endDate, limit = 50, lastEvaluatedKey } = queryParams;
  
  let params = {
    TableName: SUBMISSIONS_TABLE,
    Limit: parseInt(limit, 10)
  };
  
  // Add pagination if lastEvaluatedKey is provided
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString());
  }
  
  // Add filters if provided
  if (status || startDate || endDate) {
    let filterExpression = [];
    let expressionAttributeValues = {};
    
    if (status) {
      filterExpression.push('status = :status');
      expressionAttributeValues[':status'] = status;
    }
    
    if (startDate) {
      filterExpression.push('timestamp >= :startDate');
      expressionAttributeValues[':startDate'] = startDate;
    }
    
    if (endDate) {
      filterExpression.push('timestamp <= :endDate');
      expressionAttributeValues[':endDate'] = endDate;
    }
    
    params.FilterExpression = filterExpression.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  const result = await dynamodb.scan(params).promise();
  
  // Format the response
  return {
    submissions: result.Items,
    pagination: result.LastEvaluatedKey ? {
      nextToken: Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    } : null
  };
};

/**
 * Lambda handler for retrieving form submissions
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Get submissions
    const result = await getSubmissions(queryParams);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};