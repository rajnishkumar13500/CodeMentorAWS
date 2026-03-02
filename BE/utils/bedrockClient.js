const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { AWS_BEDROCK_REGION } = require('../config/env');
const logger = require('../config/logger');

// Singleton client — reused across all calls
let client = null;

const getClient = () => {
    if (!client) {
        client = new BedrockRuntimeClient({ region: AWS_BEDROCK_REGION });
        // Credentials are auto-resolved from env vars (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
        // or from ~/.aws/credentials, IAM roles, etc.
    }
    return client;
};

/**
 * Invoke a Bedrock model using the Converse API.
 *
 * @param {Object} options
 * @param {string} options.modelId     — Bedrock model ID (e.g. 'us.anthropic.claude-3-haiku-20240307-v1:0')
 * @param {string} options.systemPrompt — system-level instruction
 * @param {string} options.userPrompt   — user message
 * @param {number} [options.maxTokens=1024]
 * @param {number} [options.temperature=0.3]
 * @returns {Promise<string>} — extracted text response
 */
const invokeModel = async ({ modelId, systemPrompt, userPrompt, maxTokens = 1024, temperature = 0.3 }) => {
    const bedrock = getClient();

    const input = {
        modelId,
        messages: [
            {
                role: 'user',
                content: [{ text: userPrompt }],
            },
        ],
        inferenceConfig: {
            maxTokens,
            temperature,
        },
    };

    // Add system prompt if provided
    if (systemPrompt) {
        input.system = [{ text: systemPrompt }];
    }

    logger.info('Sending Bedrock Converse request', {
        modelId,
        systemPromptLength: systemPrompt ? systemPrompt.length : 0,
        userPromptLength: userPrompt.length,
        maxTokens,
        temperature,
    });

    const command = new ConverseCommand(input);
    const response = await bedrock.send(command);

    // Converse response: { output: { message: { content: [{ text }], role } }, stopReason, usage, metrics }
    const text = response.output?.message?.content?.[0]?.text || '';

    logger.info('Bedrock Converse response received', {
        modelId,
        responseLength: text.length,
        stopReason: response.stopReason,
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
        latencyMs: response.metrics?.latencyMs,
    });

    return text;
};

module.exports = { invokeModel };
