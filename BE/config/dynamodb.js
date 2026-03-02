const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.NODE_ENV === 'development' && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  }),
});

// Create document client for easier operations
const docClient = DynamoDBDocumentClient.from(client);

// Table name
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'CompilerAI';

module.exports = {
  docClient,
  TABLE_NAME,
};