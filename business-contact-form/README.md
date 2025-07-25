# Business Contact Form

A serverless business contact form application built with Node.js and React, hosted on AWS.

## Architecture

This application uses a serverless architecture to minimize costs:

- **Frontend**: React application hosted on S3 and delivered via CloudFront
- **Backend**: AWS Lambda functions with API Gateway
- **Database**: DynamoDB for storing form submissions
- **Email**: SES for sending notifications
- **Domain**: Route53 for DNS management of "thunk-it.com"

## Prerequisites

- AWS CLI installed and configured with the "devops" profile
- AWS SAM CLI installed
- Node.js and npm installed
- Domain "thunk-it.com" registered in Route53

## Deployment

1. Clone this repository
2. Navigate to the project directory
3. Run the deployment script:

```bash
./deploy.sh
```

The script will:

- Build the backend Lambda functions
- Deploy the SAM template to create AWS resources
- Build the React frontend
- Upload the frontend to S3
- Output the API endpoint and website URL

## Post-Deployment Steps

After deployment, you need to:

1. Configure Route53 to point "thunk-it.com" to the CloudFront distribution
2. Set up SES to verify your domain for sending emails
3. Create an API key for admin access

## Estimated Costs

For a low-traffic business contact form (< 1000 submissions per month), most services will remain within the AWS free tier. The primary fixed cost is the Route 53 hosted zone ($0.50/month).

| Service     | Monthly Cost (USD)    |
| ----------- | --------------------- |
| Route 53    | $0.50                 |
| S3          | $0.00 (Free tier)     |
| CloudFront  | $0.00 (Free tier)     |
| Lambda      | $0.00 (Free tier)     |
| API Gateway | $0.00 (Free tier)     |
| DynamoDB    | $0.00 (Free tier)     |
| SES         | $0.10 per 1000 emails |
| **Total**   | **$0.60 - $2.00**     |

## Local Development and Testing

You can test the entire application locally on your macOS 15.5 before deploying to AWS.

### Prerequisites for Local Testing

1. Install AWS SAM CLI:

   ```bash
   brew install aws-sam-cli
   ```

2. Install Docker Desktop for macOS:
   Download from [Docker Hub](https://hub.docker.com/editions/community/docker-ce-desktop-mac/)

3. Install Node.js and npm:
   ```bash
   brew install node
   ```

### Running the Application Locally

We've provided a convenient script to set up the local development environment:

```bash
./local-dev.sh
```

This script will:

1. Install all dependencies for both frontend and backend
2. Start the SAM local API on port 3001
3. Configure the frontend to use the local API
4. Start the React development server on port 3000

You can then access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manual Local Setup

If you prefer to set up the local environment manually:

#### Frontend

The frontend is a React application located in the `frontend` directory.

```bash
cd frontend
echo "REACT_APP_API_ENDPOINT=http://localhost:3001/contact" > .env
npm install
npm start
```

This will start the React development server on port 3000.

#### Backend

The backend consists of three Lambda functions:

1. `form-submission`: Handles form submissions
2. `admin-get-submissions`: Retrieves form submissions for admin
3. `admin-update-submission`: Updates submission status

To test the backend locally:

```bash
# Install dependencies for each Lambda function
cd backend/form-submission
npm install
cd ../admin-get-submissions
npm install
cd ../admin-update-submission
npm install
cd ../..

# Start the local API
sam local start-api --env-vars env.json --port 3001
```

### Testing Form Submissions

When testing locally, the emails won't actually be sent since SES is not available locally. However, you can see the email content in the SAM CLI logs.

For DynamoDB, the SAM local API will use an in-memory database that simulates the DynamoDB service. You can pre-populate it with test data using the `dynamodb-local.json` file.

### Testing Admin Functionality

To test the admin endpoints locally, you'll need to make direct API calls since there's no admin UI implemented yet. You can use tools like Postman or curl:

```bash
# Get all submissions
curl http://localhost:3001/submissions

# Update a submission status
curl -X PUT http://localhost:3001/submissions/sample-id-1?timestamp=2025-07-22T10:00:00Z \
  -H "Content-Type: application/json" \
  -d '{"status": "viewed"}'
```

## License

This project is licensed under the MIT License.
