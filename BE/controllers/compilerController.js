const axios = require('axios');
const { AWS_COMPILER_API_URL } = require('../config/env');
const logger = require('../config/logger');

exports.compile = async (req, res) => {
  const { code, language, input } = req.body || {};

  // Ensure input is a string and normalize line endings
  const formattedInput = (typeof input === 'string' ? input : '').replace(/\r\n/g, '\n');

  logger.info('Compile request received', {
    language,
    codeLength: code ? code.length : 0,
    inputLength: formattedInput.length,
    hasCode: !!code,
    hasInput: !!formattedInput
  });

  try {
    logger.info('Calling Lambda compiler service', {
      language,
      codeLength: code ? code.length : 0,
      inputLength: formattedInput.length
    });

    // Ensure language is lowercase for Lambda
    const languageLower = typeof language === 'string' ? language.toLowerCase() : language;
    // If the language is 'cpp', change it to 'c++' for Lambda API compatibility
    let lambdaLanguage = languageLower;
    if (lambdaLanguage === 'cpp' ) {
      lambdaLanguage = 'c++';
    }
    const lambdaResponse = await axios.post(
      AWS_COMPILER_API_URL,
      { code, language, input: formattedInput },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    logger.info('Lambda response received', {
      status: lambdaResponse.status,
      hasBody: !!lambdaResponse.data,
      responseSize: JSON.stringify(lambdaResponse.data).length
    });

    if (lambdaResponse.data && Object.prototype.hasOwnProperty.call(lambdaResponse.data, 'body')) {
      const result = typeof lambdaResponse.data.body === 'string'
        ? JSON.parse(lambdaResponse.data.body)
        : lambdaResponse.data.body;

      logger.info('Compilation successful', {
        hasOutput: !!result.output,
        hasError: !!result.error,
        outputLength: result.output ? result.output.length : 0
      });

      return res.json({ output: result.output || result.error || 'No output' });
    }

    logger.error('Invalid Lambda response format', {
      responseData: lambdaResponse.data,
      hasBody: !!lambdaResponse.data
    });

    return res.status(500).json({ success: false, error: 'Invalid Lambda response format' });
  } catch (error) {
    logger.error('Compilation failed', {
      error: {
        message: error.message,
        name: error.name,
        code: error.code
      },
      response: {
        status: error.response?.status,
        data: error.response?.data
      },
      language,
      codeLength: code ? code.length : 0
    });

    return res.status(500).json({ success: false, error: `Lambda invocation failed: ${error.message}` });
  }
};


