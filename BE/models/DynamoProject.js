const { docClient, TABLE_NAME } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

class DynamoProject {
  constructor(data) {
    this._id = data._id || uuidv4();
    this.user = data.user;
    this.name = data.name;
    this.language = data.language;
    this.code = data.code || '';
    this.input = data.input || '';
    this.diagram = data.diagram || '';
    this.question = data.question || '';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Create or update project
  async save() {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${this.user}`,
        SK: `PROJECT#${this._id}`,
        Type: 'Project',
        _id: this._id,
        user: this.user,
        name: this.name,
        language: this.language,
        code: this.code,
        input: this.input,
        diagram: this.diagram,
        mermaidDiagram: this.diagram, // Legacy compatibility
        question: this.question,
        createdAt: this.createdAt,
      },
    };

    await docClient.send(new PutCommand(params));
    return this;
  }

  // Find all projects for a user
  static async find(query) {
    if (!query.user) return [];

    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${query.user}`,
        ':sk': 'PROJECT#',
      },
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items.map(item => new DynamoProject(item));
  }

  // Find specific project by ID and user
  static async findOne(query) {
    if (!query._id || !query.user) return null;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${query.user}`,
        SK: `PROJECT#${query._id}`,
      },
    };

    const result = await docClient.send(new GetCommand(params));
    if (!result.Item) return null;

    return new DynamoProject(result.Item);
  }

  // Update project
  async updateOne(updates) {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = updates[key];
        expressionAttributeNames[`#${key}`] = key;
        
        // Update local instance
        this[key] = updates[key];
        
        // Legacy compatibility for diagram
        if (key === 'diagram') {
          updateExpressions.push(`#mermaidDiagram = :${key}`);
          expressionAttributeNames['#mermaidDiagram'] = 'mermaidDiagram';
        }
      }
    });

    if (updateExpressions.length === 0) return this;

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${this.user}`,
        SK: `PROJECT#${this._id}`,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    };

    const result = await docClient.send(new UpdateCommand(params));
    return new DynamoProject(result.Attributes);
  }

  // Convert to object (for compatibility)
  toObject() {
    return {
      _id: this._id,
      user: this.user,
      name: this.name,
      language: this.language,
      code: this.code,
      input: this.input,
      diagram: this.diagram,
      mermaidDiagram: this.diagram, // Legacy compatibility
      question: this.question,
      createdAt: this.createdAt,
    };
  }
}

module.exports = DynamoProject;