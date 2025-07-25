#!/bin/bash

# Exit on error
set -e

# Configuration
LOCAL_API_PORT=3001
LOCAL_FRONTEND_PORT=3000
DYNAMODB_ADMIN_PORT=8001

echo "Setting up local development environment for Business Contact Form"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

# Start DynamoDB Local and DynamoDB Admin using Docker Compose
echo "Starting DynamoDB Local and DynamoDB Admin..."
docker-compose up -d

# Create DynamoDB table locally
echo "Creating DynamoDB table locally..."
aws dynamodb create-table \
  --table-name ContactSubmissions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region us-east-1 \
  > /dev/null 2>&1 || echo "Table already exists or couldn't be created"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend/form-submission
npm install
cd ../admin-get-submissions
npm install
cd ../admin-update-submission
npm install
cd ../..

# Start SAM local API in the background
echo "Starting SAM local API on port $LOCAL_API_PORT..."
sam local start-api --env-vars env.json --port $LOCAL_API_PORT --docker-network business-contact-form_local-dev &
SAM_PID=$!

# Wait for API to start
echo "Waiting for local API to start..."
sleep 5

# Set up frontend environment
echo "Setting up frontend environment..."
cd frontend
echo "REACT_APP_API_ENDPOINT=http://localhost:$LOCAL_API_PORT/contact" > .env
npm install

# Start frontend development server
echo "Starting frontend development server on port $LOCAL_FRONTEND_PORT..."
npm start &
FRONTEND_PID=$!

echo ""
echo "Local development environment is running!"
echo "Frontend: http://localhost:$LOCAL_FRONTEND_PORT"
echo "Backend API: http://localhost:$LOCAL_API_PORT"
echo "DynamoDB Admin: http://localhost:$DYNAMODB_ADMIN_PORT"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "kill $SAM_PID $FRONTEND_PID; docker-compose down; exit" INT
wait