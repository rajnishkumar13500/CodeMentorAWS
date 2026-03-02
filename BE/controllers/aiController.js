const { BEDROCK_HINT_MODEL, BEDROCK_INTUITION_MODEL } = require('../config/env');
const { invokeModel } = require('../utils/bedrockClient');
const logger = require('../config/logger');

exports.hint = async (req, res) => {
  try {
    const { problemStatement, code } = req.body || {};

    logger.info('AI hint request received', {
      hasProblemStatement: !!problemStatement,
      hasCode: !!code,
      problemLength: problemStatement ? problemStatement.length : 0,
      codeLength: code ? code.length : 0
    });

    const userPrompt = `You are an expert programming tutor. Given the following problem statement and the code written so far, give a concise hint focused on the next step the user should take in their solution. Do not give away the answer, but suggest a direction or concept to consider next.\n\nProblem Statement:\n${problemStatement}\n\nCurrent Code:\n${code}\n\nProvide the next-step hint only (1-2 sentences, under 50 words).`;

    logger.info('Calling Bedrock Converse API for next-step hint', {
      model: BEDROCK_HINT_MODEL,
      promptLength: userPrompt.length
    });

    const text = await invokeModel({
      modelId: BEDROCK_HINT_MODEL,
      systemPrompt: 'You are a concise programming tutor.',
      userPrompt,
      temperature: 0.4,
      maxTokens: 150
    });

    logger.info('AI next-step hint response generated', {
      responseLength: text.length,
      hasResponse: !!text
    });

    return res.json({ content: text });
  } catch (err) {
    logger.error('AI hint request failed', {
      error: {
        message: err.message,
        name: err.name
      },
      hasProblemStatement: !!req.body?.problemStatement,
      hasCode: !!req.body?.code
    });

    return res.status(500).json({ error: err.message });
  }
};

exports.intuition = async (req, res) => {
  try {
    const { problemStatement } = req.body || {};

    logger.info('AI intuition request received', {
      hasProblemStatement: !!problemStatement,
      problemLength: problemStatement ? problemStatement.length : 0
    });

    const userPrompt = `Given this programming problem: ${problemStatement}\n\nProvide: 1) why interesting, 2) analogy, 3) key observations, 4) what to think before coding. No code or direct steps. Concise as possible`;

    logger.info('Calling Bedrock Converse API for intuition', {
      model: BEDROCK_INTUITION_MODEL,
      promptLength: userPrompt.length
    });

    const text = await invokeModel({
      modelId: BEDROCK_INTUITION_MODEL,
      systemPrompt: 'You are a thoughtful programming mentor who builds intuition.',
      userPrompt,
      temperature: 0.5,
      maxTokens: 1024
    });

    logger.info('AI intuition response generated', {
      responseLength: text.length,
      hasResponse: !!text
    });

    return res.json({ content: text });
  } catch (err) {
    logger.error('AI intuition request failed', {
      error: {
        message: err.message,
        name: err.name
      },
      hasProblemStatement: !!req.body?.problemStatement
    });

    return res.status(500).json({ error: err.message });
  }
};
