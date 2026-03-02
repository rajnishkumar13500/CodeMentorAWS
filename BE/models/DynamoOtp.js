const { docClient, TABLE_NAME } = require('../config/dynamodb');
const { PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

class DynamoOtp {
  constructor(data) {
    this.email = data.email?.toLowerCase().trim();
    this.otp = data.otp;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.ttl = data.ttl || Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
  }

  // Create OTP
  async save() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        PK: `OTP#${this.email}`,
        SK: `OTP#${this.createdAt}`,
        Type: 'Otp',
        email: this.email,
        otp: this.otp,
        createdAt: this.createdAt,
        ttl: this.ttl, // DynamoDB TTL attribute
      },
    };

    await docClient.send(new PutCommand(params));
    return this;
  }

  // Find latest OTP for email
  static async findOne(query) {
    if (!query.email) return null;

    const email = query.email.toLowerCase().trim();
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `OTP#${email}`,
      },
      ScanIndexForward: false, // Sort descending (latest first)
      Limit: 1,
    };

    const result = await docClient.send(new QueryCommand(params));
    if (!result.Items || result.Items.length === 0) return null;

    return new DynamoOtp(result.Items[0]);
  }

  // Delete all OTPs for an email
  static async deleteMany(query) {
    if (!query.email) return { deletedCount: 0 };

    const email = query.email.toLowerCase().trim();
    
    // First, get all OTPs for this email
    const queryParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `OTP#${email}`,
      },
    };

    const result = await docClient.send(new QueryCommand(queryParams));
    
    if (!result.Items || result.Items.length === 0) {
      return { deletedCount: 0 };
    }

    // Delete each OTP
    const deletePromises = result.Items.map(item => {
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      };
      return docClient.send(new DeleteCommand(deleteParams));
    });

    await Promise.all(deletePromises);
    return { deletedCount: result.Items.length };
  }

  // Sort method for compatibility
  sort() {
    return this;
  }
}

module.exports = DynamoOtp;