// generateMermaid.js
// Bedrock Converse integration for Mermaid diagram generation, with local fallback.

const { BEDROCK_DIAGRAM_MODEL } = require('../config/env');
const { invokeModel } = require('../utils/bedrockClient');
const logger = require('../config/logger');
const { generateSimpleMermaid, generateAdvancedMermaid } = require('./mermaidFallback');

// -------------------------
// Utilities
// -------------------------

// Extract a Mermaid block from arbitrary text safely
const extractMermaid = (text = '') => {
  if (!text) return '';
  let t = String(text);

  // Strip BOM + trim
  t = t.replace(/^\uFEFF/, '').trim();

  // If fenced mermaid block exists, extract inner
  const fenced = t.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) t = fenced[1];

  // If not starting with flowchart/graph, slice from first occurrence
  if (!/^(flowchart|graph)\s/i.test(t)) {
    const idx = t.search(/\b(flowchart|graph)\s/i);
    if (idx >= 0) t = t.slice(idx);
  }

  // Clean noise
  t = t.replace(/^mermaid\s*/i, '').trim();        // leading "mermaid"
  t = t.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, ''); // stray fences
  t = t.replace(/^"+|"+$/g, '');                   // outer quotes
  t = t.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim(); // unescape

  return t;
};

const isMermaidLike = (s = '') => /^(flowchart|graph)\s/i.test(s);

// -------------------------
// Prompt Builder
// -------------------------
const buildPrompt = ({ code, language, existingDiagram }) => {
  const safeLanguage = (language || 'python').toLowerCase();
  const codeSnippet = typeof code === 'string' ? code.trim() : '';
  const hasCode = codeSnippet.length > 0;
  const priorDiagram = typeof existingDiagram === 'string' ? existingDiagram.trim() : '';

  const header = `You are a tool that outputs ONLY Mermaid diagrams representing program control flow.`;

  const instructions = `
Rules and Requirements:
1) Output ONLY valid Mermaid syntax. Start with: flowchart TD. Do not give any other text rather than mermaid script.
2) Do NOT include prose, markdown, backticks, or explanations — only the diagram text.
3) Every node label MUST be enclosed in double quotes ("..."), including any parentheses/brackets/braces/symbols.
   • If a label itself needs double quotes (e.g., string literals), you MUST escape them as &quot;.
   • Unescaped inner double quotes are forbidden and MUST be converted to &quot;.
   Examples:
   - S(("Start"))
   - E(("End"))
   - P["cout << &quot;Hello, World!&quot; << endl;"]
   - D{"Condition?"}
   - F[["callFunction(a,b)"]]
   - DB[("resourceName")]
4) Visual design:
   - %%{init: { "theme": "neutral" }}%%
   - Use expressive shapes consistently:
     • Start/End:  S(("Start")), E(("End"))
     • Process:     P["Short action"]
     • Decision:    D{"Condition?"}
     • Subroutine:  F[["functionName()"]]
     • Database:    DB[("tableOrCache")]
   - Prefer short, clear labels in quotes — summarize logic, do not dump raw code.
   - Group related logic in subgraphs (e.g., per function/module):
     subgraph "Function: compute()"
       ...
     end
5) Flow rules:
   - Use --> for standard sequence edges.
   - For decisions, label branches clearly with quoted labels:
     D -->|"Yes"| NodeY
     D -->|"No"|  NodeN
6) Styling (use classDefs + class assignments for readability; keep labels quoted):
   - Define classes, for example:
     classDef startend fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
     classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:1px;
     classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
     classDef subr fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px;
     classDef db fill:#ede7f6,stroke:#4527a0,stroke-width:1px;
   - Assign classes to nodes, e.g.:
     class S,E startend;
     class D decision;
     class P process;
     class F subr;
     class DB db;
7) If an existing diagram is provided, edit/improve it to reflect the code while preserving useful structure; enhance with shapes, subgraphs, classes, and quoted labels. While improving, REWRITE any unescaped inner double quotes in labels to &quot; to ensure valid Mermaid.
8) If the code is missing or unclear, output a minimal valid diagram with quoted TODO nodes (still visually structured).
9) Always return ONE valid Mermaid diagram only — no text, comments, or formatting.
`;

  const existing = priorDiagram
    ? `Existing diagram to improve (use shapes, subgraphs, classes, and quoted labels; fix inner quotes using &quot; where needed):\n${priorDiagram}`
    : `No existing diagram provided.`;

  const src = hasCode
    ? `Source (${safeLanguage}) code to convert:\n${codeSnippet}`
    : `No source code provided.`;

  const directive = `Return ONLY the Mermaid diagram text (no markdown, no prose). Use shapes, subgraphs, classDefs, and quoted labels as specified. Escape inner double quotes inside labels as &quot;.`;

  return [header, instructions, existing, src, directive].join('\n\n');
};

// -------------------------
// Controller
// -------------------------
exports.generateMermaid = async (req, res) => {
  try {
    const { code, language, existingDiagram } = req.body || {};
    const safeLanguage = (language || 'python').toLowerCase();

    logger.info('Diagram generation request received', {
      language,
      hasCode: !!code,
      hasExistingDiagram: !!existingDiagram,
      codeLength: code ? code.length : 0,
      existingDiagramLength: existingDiagram ? existingDiagram.length : 0
    });

    // Try Bedrock first
    try {
      const prompt = buildPrompt({ code, language, existingDiagram });

      logger.info('Calling Bedrock Converse API for diagram generation', {
        model: BEDROCK_DIAGRAM_MODEL,
        promptLength: prompt.length,
        language
      });

      const raw = await invokeModel({
        modelId: BEDROCK_DIAGRAM_MODEL,
        systemPrompt: 'You generate Mermaid diagrams from code.',
        userPrompt: prompt,
        maxTokens: 2048,
        temperature: 0.2
      });

      logger.info('Bedrock raw content preview', { preview: String(raw).slice(0, 200) });

      // Clean & check
      const cleaned = extractMermaid(raw);
      logger.info('Cleaned mermaid preview', { preview: cleaned.slice(0, 200) });

      if (isMermaidLike(cleaned)) {
        logger.info('Mermaid diagram generated successfully via Bedrock API', {
          diagramLength: cleaned.length,
          isMermaid: true,
          language
        });

        return res.json({ mermaid: cleaned, source: 'bedrock-api' });
      }

      logger.warn('Bedrock content did not look like Mermaid after cleanup', {
        startsWith: cleaned.slice(0, 20),
        length: cleaned.length
      });
    } catch (bedrockError) {
      logger.warn('Bedrock API failed, falling back to local generator', {
        message: bedrockError.message,
        name: bedrockError.name,
        language,
        model: BEDROCK_DIAGRAM_MODEL
      });
    }

    // -------------------------
    // Local Fallback Generator
    // -------------------------
    logger.info('Using fallback mermaid generator', { language, codeLength: code ? code.length : 0 });

    let mermaid;
    if (code && code.trim().length > 0) {
      logger.info('Using advanced fallback mermaid generator', { language, codeLength: code ? code.length : 0 });
      mermaid = generateAdvancedMermaid(code, language);
    } else {
      mermaid = generateSimpleMermaid(code, language);
    }

    logger.info('Fallback mermaid diagram generated successfully', {
      diagramLength: mermaid.length,
      language,
      source: 'fallback'
    });

    return res.json({
      mermaid,
      source: 'fallback',
      note: 'Generated using local fallback generator'
    });

  } catch (err) {
    logger.error('Diagram generation failed completely', {
      error: {
        message: err.message,
        name: err.name,
        code: err.code
      },
      language: req.body?.language,
      hasCode: !!req.body?.code
    });

    // Final safety net
    const errorMermaid =
      'flowchart TD\n' +
      '  A[Start] --> B[Error occurred]\n' +
      '  B --> C[Please check your code]\n' +
      '  C --> D[End]';

    return res.json({
      mermaid: errorMermaid,
      source: 'error-fallback',
      note: 'Error occurred during diagram generation'
    });
  }
};
