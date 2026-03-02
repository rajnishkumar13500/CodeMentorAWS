const logger = require('../config/logger');

// Simple mermaid diagram generator as fallback
function generateSimpleMermaid(code, language) {
  logger.info('Using fallback mermaid generator', { language, codeLength: code ? code.length : 0 });
  
  const safeLanguage = (language || 'javascript').toLowerCase();
  
  // Basic flowchart patterns based on common code structures
  let mermaid = 'flowchart TD\n';
  
  if (!code || code.trim().length === 0) {
    mermaid += '  A[Start] --> B[No code provided]\n';
    mermaid += '  B --> C[End]';
    return mermaid;
  }
  
  // Clean the code
  const cleanCode = code.trim();
  
  // Check for common patterns
  if (cleanCode.includes('if') && cleanCode.includes('else')) {
    mermaid += '  A[Start] --> B{Check condition}\n';
    mermaid += '  B -->|True| C[Execute if block]\n';
    mermaid += '  B -->|False| D[Execute else block]\n';
    mermaid += '  C --> E[End]\n';
    mermaid += '  D --> E[End]';
  } else if (cleanCode.includes('for') || cleanCode.includes('while')) {
    mermaid += '  A[Start] --> B[Initialize loop]\n';
    mermaid += '  B --> C{Loop condition}\n';
    mermaid += '  C -->|True| D[Execute loop body]\n';
    mermaid += '  D --> E[Update loop variable]\n';
    mermaid += '  E --> C\n';
    mermaid += '  C -->|False| F[End]';
  } else if (cleanCode.includes('function') || cleanCode.includes('def')) {
    mermaid += '  A[Start] --> B[Define function]\n';
    mermaid += '  B --> C[Function body]\n';
    mermaid += '  C --> D[Return value]\n';
    mermaid += '  D --> E[End]';
  } else if (cleanCode.includes('switch') || cleanCode.includes('case')) {
    mermaid += '  A[Start] --> B[Evaluate expression]\n';
    mermaid += '  B --> C{Match case?}\n';
    mermaid += '  C -->|Case 1| D[Execute case 1]\n';
    mermaid += '  C -->|Case 2| E[Execute case 2]\n';
    mermaid += '  C -->|Default| F[Execute default]\n';
    mermaid += '  D --> G[End]\n';
    mermaid += '  E --> G[End]\n';
    mermaid += '  F --> G[End]';
  } else {
    // Generic flowchart
    mermaid += '  A[Start] --> B[Execute code]\n';
    mermaid += '  B --> C[Process result]\n';
    mermaid += '  C --> D[End]';
  }
  
  return mermaid;
}

// Enhanced mermaid generator with more sophisticated parsing
function generateAdvancedMermaid(code, language) {
  logger.info('Using advanced fallback mermaid generator', { language, codeLength: code ? code.length : 0 });
  
  const safeLanguage = (language || 'javascript').toLowerCase();
  const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let mermaid = 'flowchart TD\n';
  let nodeCounter = 0;
  const nodes = [];
  
  // Add start node
  nodes.push(`A[Start]`);
  nodeCounter++;
  
  // Parse code line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nodeId = String.fromCharCode(65 + nodeCounter); // A, B, C, etc.
    
    if (line.includes('if') && line.includes('(')) {
      // Extract condition
      const condition = line.match(/if\s*\(([^)]+)\)/)?.[1] || 'condition';
      nodes.push(`${nodeId}{${condition}}`);
      nodeCounter++;
    } else if (line.includes('else if')) {
      const condition = line.match(/else if\s*\(([^)]+)\)/)?.[1] || 'else condition';
      nodes.push(`${nodeId}{${condition}}`);
      nodeCounter++;
    } else if (line.includes('else')) {
      nodes.push(`${nodeId}[Else block]`);
      nodeCounter++;
    } else if (line.includes('for') || line.includes('while')) {
      const loopType = line.includes('for') ? 'For loop' : 'While loop';
      nodes.push(`${nodeId}[${loopType}]`);
      nodeCounter++;
    } else if (line.includes('function') || line.includes('def')) {
      const funcName = line.match(/(?:function|def)\s+(\w+)/)?.[1] || 'function';
      nodes.push(`${nodeId}[Define ${funcName}]`);
      nodeCounter++;
    } else if (line.includes('return')) {
      nodes.push(`${nodeId}[Return]`);
      nodeCounter++;
    } else if (line.includes('console.log') || line.includes('print')) {
      const output = line.match(/console\.log\(['"]([^'"]+)['"]\)|print\(['"]([^'"]+)['"]\)/);
      const message = output?.[1] || output?.[2] || 'output';
      nodes.push(`${nodeId}[Print: ${message}]`);
      nodeCounter++;
    } else if (line.trim().length > 0) {
      // Generic statement
      const statement = line.length > 30 ? line.substring(0, 30) + '...' : line;
      nodes.push(`${nodeId}[${statement}]`);
      nodeCounter++;
    }
  }
  
  // Add end node
  const endNodeId = String.fromCharCode(65 + nodeCounter);
  nodes.push(`${endNodeId}[End]`);
  
  // Build connections
  mermaid += nodes.join('\n') + '\n';
  
  // Add basic connections (simplified)
  for (let i = 0; i < nodes.length - 1; i++) {
    const currentNode = String.fromCharCode(65 + i);
    const nextNode = String.fromCharCode(65 + i + 1);
    mermaid += `  ${currentNode} --> ${nextNode}\n`;
  }
  
  return mermaid.trim();
}

module.exports = {
  generateSimpleMermaid,
  generateAdvancedMermaid
};
