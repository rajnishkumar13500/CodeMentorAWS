const { docClient, TABLE_NAME } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

class DynamoUser {
  constructor(data) {
    this.email = data.email?.toLowerCase().trim();
    this.password = data.password;
    this.displayName = data.displayName?.trim();
    this.isVerified = data.isVerified || false;
    this.photo = data.photo;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Create user
  async save() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${this.email}`,
        SK: `USER#${this.email}`,
        Type: 'User',
        email: this.email,
        password: this.password,
        displayName: this.displayName,
        isVerified: this.isVerified,
        photo: this.photo,
        createdAt: this.createdAt,
      },
    };

    await docClient.send(new PutCommand(params));
    return this;
  }

  // Find user by email
  static async findOne(query) {
    if (!query.email) return null;
    
    const email = query.email.toLowerCase().trim();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${email}`,
        SK: `USER#${email}`,
      },
    };

    const result = await docClient.send(new GetCommand(params));
    if (!result.Item) return null;

    return new DynamoUser(result.Item);
  }

  // Find user by ID (email in our case)
  static async findById(id) {
    return this.findOne({ email: id });
  }

  // Update user verification status
  static async findOneAndUpdate(query, update) {
    if (!query.email) return null;
    
    const email = query.email.toLowerCase().trim();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${email}`,
        SK: `USER#${email}`,
      },
      UpdateExpression: 'SET isVerified = :verified',
      ExpressionAttributeValues: {
        ':verified': update.isVerified,
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await docClient.send(new UpdateCommand(params));
    if (!result.Attributes) return null;

    return new DynamoUser(result.Attributes);
  }

  // Delete user
  static async deleteOne(query) {
    if (!query._id && !query.email) return null;
    
    const email = query.email || query._id;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${email}`,
        SK: `USER#${email}`,
      },
    };

    await docClient.send(new DeleteCommand(params));
    return { deletedCount: 1 };
  }

  // Select method to exclude password
  select(fields) {
    if (fields === '-password') {
      const user = { ...this };
      delete user.password;
      return user;
    }
    return this;
  }

  // Convert to object (for compatibility)
  toObject() {
    return {
      _id: this.email,
      email: this.email,
      displayName: this.displayName,
      isVerified: this.isVerified,
      photo: this.photo,
      createdAt: this.createdAt,
    };
  }
}

module.exports = DynamoUser;