#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_PROFILE="devops"
AWS_ACCOUNT_ID="052384102251"
AWS_REGION="us-east-1"
STACK_NAME="business-contact-form"
DOMAIN_NAME="thunk-it.com"

echo "Deploying Business Contact Form to AWS account $AWS_ACCOUNT_ID using profile $AWS_PROFILE"

# Build backend
echo "Installing backend dependencies..."
cd backend/form-submission
npm install
cd ../admin-get-submissions
npm install
cd ../admin-update-submission
npm install
cd ../..

# Deploy SAM template
echo "Deploying SAM template..."
sam build
sam deploy --stack-name $STACK_NAME \
  --parameter-overrides DomainName=$DOMAIN_NAME \
  --capabilities CAPABILITY_IAM \
  --profile $AWS_PROFILE \
  --region $AWS_REGION

# Get outputs from CloudFormation
echo "Getting CloudFormation outputs..."
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ContactFormApi'].OutputValue" --output text --profile $AWS_PROFILE --region $AWS_REGION)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" --output text --profile $AWS_PROFILE --region $AWS_REGION)
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomainName'].OutputValue" --output text --profile $AWS_PROFILE --region $AWS_REGION)

# Build frontend
echo "Building frontend..."
cd frontend
echo "REACT_APP_API_ENDPOINT=$API_ENDPOINT" > .env
npm install
npm run build
cd ..

# Upload frontend to S3
echo "Uploading frontend to S3..."
aws s3 sync frontend/build/ s3://$S3_BUCKET/ --delete --profile $AWS_PROFILE --region $AWS_REGION

echo "Deployment complete!"
echo "API Endpoint: $API_ENDPOINT"
echo "Website URL: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "Next steps:"
echo "1. Configure Route53 to point $DOMAIN_NAME to the CloudFront distribution"
echo "2. Set up SES to verify your domain for sending emails"
echo "3. Create an API key for admin access"