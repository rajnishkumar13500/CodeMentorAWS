/**
 * API Utility Functions
 * Handles all API calls to the backend
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Update project (for authenticated users)
export async function updateProject(
  projectId: string,
  updates: {
    code?: string;
    language?: string;
    mermaidDiagram?: string;
    mermaidMetadata?: {
      title?: string;
    };
  }
) {
  try {
    const response = await fetch(`${API_URL}/project/${projectId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

// Compile code
export async function compileCode(code: string, language: string, input: string) {
  const response = await fetch(`${API_URL}/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, input }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Generate Mermaid diagram
export async function generateMermaidDiagram(code: string, language: string, existingDiagram?: string) {
  const response = await fetch(`${API_URL}/diagram/mermaid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, existingDiagram }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get AI hint
export async function getAIHint(problemStatement: string, code: string) {
  const response = await fetch(`${API_URL}/ai/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemStatement, code }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get AI intuition
export async function getAIIntuition(problemStatement: string) {
  const response = await fetch(`${API_URL}/ai/intuition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemStatement }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
