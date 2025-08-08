let AWS;
try {
  AWS = require('aws-sdk');
} catch (err) {
  // Minimal stubs for testing environments where aws-sdk is unavailable
  AWS = {
    DynamoDB: { DocumentClient: function () {} },
    SES: function () {}
  };
}
let uuidv4;
try {
  ({ v4: uuidv4 } = require('uuid'));
} catch (err) {
  // Simple stub for environments without the uuid package
  uuidv4 = () => '00000000-0000-4000-8000-000000000000';
}

// Check if we're running locally
const isLocal = process.env.AWS_SAM_LOCAL === 'true';

// Initialize AWS services
const dynamodbOptions = isLocal ? {
  endpoint: 'http://dynamodb-local:8000',
  region: 'us-east-1'
} : {};
const dynamodb = new AWS.DynamoDB.DocumentClient(dynamodbOptions);
const ses = new AWS.SES();

// Environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SUBMISSIONS_TABLE = process.env.SUBMISSIONS_TABLE;

/**
 * Validates the form submission data
 * @param {Object} data - The form submission data
 * @returns {Object} - Validation result with isValid and errors
 */
const validateFormData = (data) => {
  const errors = {};

  // Validate name
  const name = data.name ? data.name.trim() : '';
  if (!name) {
    errors.name = 'Name is required';
  } else {
    data.name = name;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = data.email ? data.email.trim() : '';
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Valid email is required';
  } else {
    data.email = email;
  }

  // Validate message
  const message = data.message ? data.message.trim() : '';
  if (!message) {
    errors.message = 'Message is required';
  } else {
    data.message = message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Stores the form submission in DynamoDB
 * @param {Object} data - The form submission data
 * @returns {Promise} - Promise resolving to the stored item
 */
const storeSubmission = async (data) => {
  const timestamp = new Date().toISOString();
  const id = uuidv4();
  
  const item = {
    id,
    timestamp,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    company: data.company || '',
    message: data.message,
    status: 'new',
    ipAddress: data.ipAddress || '',
    userAgent: data.userAgent || ''
  };
  
  const params = {
    TableName: SUBMISSIONS_TABLE,
    Item: item
  };
  
  await dynamodb.put(params).promise();
  return item;
};

/**
 * Sends email notifications
 * @param {Object} data - The form submission data
 * @returns {Promise} - Promise resolving when emails are sent
 */
const sendEmailNotifications = async (data) => {
  // Create email content
  const adminEmailContent = `
New contact form submission:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Company: ${data.company || 'Not provided'}
Message: ${data.message}

Submission ID: ${data.id}
Timestamp: ${data.timestamp}
  `;
  
  const userEmailContent = `
Dear ${data.name},

Thank you for contacting us. We have received your message and will get back to you as soon as possible.

Best regards,
The Thunk-it.com Team
  `;
  
  // Check if we're running locally
  const isLocal = process.env.AWS_SAM_LOCAL === 'true';
  
  if (isLocal) {
    // When running locally, just log the emails
    console.log('==========================================');
    console.log('LOCAL DEVELOPMENT - EMAIL NOT ACTUALLY SENT');
    console.log('==========================================');
    console.log('Admin Email:');
    console.log(adminEmailContent);
    console.log('==========================================');
    console.log('User Email:');
    console.log(userEmailContent);
    console.log('==========================================');
    return true;
  } else {
    // In production, send actual emails
    // Send notification to admin
    const adminParams = {
      Source: `no-reply@${process.env.DOMAIN_NAME}`,
      Destination: {
        ToAddresses: [ADMIN_EMAIL]
      },
      Message: {
        Subject: {
          Data: 'New Contact Form Submission'
        },
        Body: {
          Text: {
            Data: adminEmailContent
          }
        }
      }
    };
    
    // Send confirmation to user
    const userParams = {
      Source: `no-reply@${process.env.DOMAIN_NAME}`,
      Destination: {
        ToAddresses: [data.email]
      },
      Message: {
        Subject: {
          Data: 'Thank you for contacting us'
        },
        Body: {
          Text: {
            Data: userEmailContent
          }
        }
      }
    };
    
    try {
      await ses.sendEmail(adminParams).promise();
      await ses.sendEmail(userParams).promise();
      return true;
    } catch (error) {
      console.error('Error sending emails:', error);
      return false;
    }
  }
};

/**
 * Lambda handler for form submissions
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Add request metadata
    body.ipAddress = event.requestContext?.identity?.sourceIp || '';
    body.userAgent = event.requestContext?.identity?.userAgent || '';
    
    // Validate form data
    const validation = validateFormData(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://thunk-it.com'
        },
        body: JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors
        })
      };
    }
    
    // Store submission in DynamoDB
    const submission = await storeSubmission(body);
    
    // Send email notifications
    await sendEmailNotifications(submission);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://thunk-it.com'
      },
      body: JSON.stringify({
        message: 'Form submission successful',
        submissionId: submission.id
      })
    };
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://thunk-it.com'
      },
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};

// Export for testing purposes
exports.validateFormData = validateFormData;
