const dotenv = require('dotenv');

// Load environment variables once at startup
dotenv.config();

const PORT = process.env.PORT || 3000;
const AWS_COMPILER_API_URL = process.env.AWS_COMPILER_API_URL;

// AWS Bedrock configuration
const AWS_BEDROCK_REGION = process.env.AWS_BEDROCK_REGION || 'us-east-1';
const BEDROCK_HINT_MODEL = process.env.BEDROCK_HINT_MODEL || 'us.anthropic.claude-3-haiku-20240307-v1:0';
const BEDROCK_DIAGRAM_MODEL = process.env.BEDROCK_DIAGRAM_MODEL || 'us.anthropic.claude-3-haiku-20240307-v1:0';
const BEDROCK_INTUITION_MODEL = process.env.BEDROCK_INTUITION_MODEL || 'us.anthropic.claude-3-haiku-20240307-v1:0';

const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const GOOGLE_SCOPES = process.env.GOOGLE_SCOPES;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

module.exports = {
  PORT,
  AWS_COMPILER_API_URL,
  AWS_BEDROCK_REGION,
  BEDROCK_HINT_MODEL,
  BEDROCK_DIAGRAM_MODEL,
  BEDROCK_INTUITION_MODEL,
  MONGO_URI,
};


