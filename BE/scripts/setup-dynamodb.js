const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  CreateTableCommand, 
  DescribeTableCommand, 
  UpdateTimeToLiveCommand 
} = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'CompilerAI';

async function createTable() {
  try {
    // Check if table already exists
    try {
      await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
      console.log(`Table ${TABLE_NAME} already exists`);
      return;
    } catch (err) {
      if (err.name !== 'ResourceNotFoundException') {
        throw err;
      }
    }

    // Create table
    const createTableParams = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },  // Partition key
        { AttributeName: 'SK', KeyType: 'RANGE' }  // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
    };

    console.log(`Creating table ${TABLE_NAME}...`);
    await client.send(new CreateTableCommand(createTableParams));
    
    // Wait for table to be active
    console.log('Waiting for table to be active...');
    let tableStatus = 'CREATING';
    while (tableStatus !== 'ACTIVE') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
      tableStatus = result.Table.TableStatus;
      console.log(`Table status: ${tableStatus}`);
    }

    // Enable TTL for OTP records
    console.log('Enabling TTL for OTP records...');
    await client.send(new UpdateTimeToLiveCommand({
      TableName: TABLE_NAME,
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true
      }
    }));

    console.log(`✅ Table ${TABLE_NAME} created successfully with TTL enabled!`);
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

// Run the setup
createTable();