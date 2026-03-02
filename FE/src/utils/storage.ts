/**
 * LocalStorage Utility for CompilerAI
 * Handles persistent storage of code, language, and Mermaid diagrams
 * Pattern: projectCode_<projectId>_<language>
 */

export interface EditorState {
  code: string;
  language: string;
  mermaidDiagram: string;
  lastModified: number;
  title?: string;
}

export interface ProjectInfo {
  id: string;
  language: string;
}

/**
 * Get storage key for project code
 */
export function getProjectCodeKey(projectId: string, language: string): string {
  return `projectCode_${projectId}_${language}`;
}

/**
 * Get storage key for Mermaid diagram
 */
export function getMermaidKey(projectId: string): string {
  return `mermaidDiagram_${projectId}`;
}

/**
 * Save code to localStorage
 */
export function saveCode(projectId: string, language: string, code: string): void {
  try {
    const key = getProjectCodeKey(projectId, language);
    localStorage.setItem(key, code);
    localStorage.setItem('lastProjectId', projectId);
    localStorage.setItem('lastLanguage', language);
  } catch (error) {
    console.error('Failed to save code to localStorage:', error);
  }
}

/**
 * Load code from localStorage
 */
export function loadCode(projectId: string, language: string): string | null {
  try {
    const key = getProjectCodeKey(projectId, language);
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to load code from localStorage:', error);
    return null;
  }
}

/**
 * Save Mermaid diagram to localStorage
 */
export function saveMermaidDiagram(projectId: string, diagram: string, title?: string): void {
  try {
    const key = getMermaidKey(projectId);
    localStorage.setItem(key, diagram);
    
    if (title) {
      localStorage.setItem(`mermaidTitle_${projectId}`, title);
    }
    
    localStorage.setItem(`mermaidLastModified_${projectId}`, Date.now().toString());
  } catch (error) {
    console.error('Failed to save Mermaid diagram to localStorage:', error);
  }
}

/**
 * Load Mermaid diagram from localStorage
 */
export function loadMermaidDiagram(projectId: string): { diagram: string; title?: string; lastModified?: number } | null {
  try {
    const key = getMermaidKey(projectId);
    const diagram = localStorage.getItem(key);
    
    if (!diagram) return null;
    
    const title = localStorage.getItem(`mermaidTitle_${projectId}`) || undefined;
    const lastModifiedStr = localStorage.getItem(`mermaidLastModified_${projectId}`);
    const lastModified = lastModifiedStr ? parseInt(lastModifiedStr, 10) : undefined;
    
    return { diagram, title, lastModified };
  } catch (error) {
    console.error('Failed to load Mermaid diagram from localStorage:', error);
    return null;
  }
}

/**
 * Get last active project info
 */
export function getLastProjectInfo(): ProjectInfo | null {
  try {
    const id = localStorage.getItem('lastProjectId');
    const language = localStorage.getItem('lastLanguage');
    
    if (id && language) {
      return { id, language };
    }
    return null;
  } catch (error) {
    console.error('Failed to get last project info:', error);
    return null;
  }
}

/**
 * Save editor state (comprehensive)
 */
export function saveEditorState(projectId: string, state: EditorState): void {
  try {
    saveCode(projectId, state.language, state.code);
    
    if (state.mermaidDiagram) {
      saveMermaidDiagram(projectId, state.mermaidDiagram, state.title);
    }
    
    localStorage.setItem('editorLanguage', state.language);
  } catch (error) {
    console.error('Failed to save editor state:', error);
  }
}

/**
 * Load editor state (comprehensive)
 */
export function loadEditorState(projectId: string, language: string): EditorState | null {
  try {
    const code = loadCode(projectId, language);
    const mermaidData = loadMermaidDiagram(projectId);
    
    if (!code) return null;
    
    return {
      code,
      language,
      mermaidDiagram: mermaidData?.diagram || '',
      lastModified: mermaidData?.lastModified || Date.now(),
      title: mermaidData?.title
    };
  } catch (error) {
    console.error('Failed to load editor state:', error);
    return null;
  }
}

/**
 * Clear project data from localStorage
 */
export function clearProjectData(projectId: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(projectId)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear project data:', error);
  }
}

/**
 * Get all stored project IDs
 */
export function getAllProjectIds(): string[] {
  try {
    const keys = Object.keys(localStorage);
    const projectIds = new Set<string>();
    
    keys.forEach(key => {
      const match = key.match(/^projectCode_([^_]+)_/);
      if (match) {
        projectIds.add(match[1]);
      }
    });
    
    return Array.from(projectIds);
  } catch (error) {
    console.error('Failed to get all project IDs:', error);
    return [];
  }
}

/**
 * Migrate old localStorage keys to new format (if needed)
 */
export function migrateOldStorage(): void {
  try {
    // Check for old format keys (editorCode, editorLanguage, mermaidDiagram)
    const oldCode = localStorage.getItem('editorCode');
    const oldLanguage = localStorage.getItem('editorLanguage');
    const oldDiagram = localStorage.getItem('mermaidDiagram');
    
    if (oldCode || oldLanguage || oldDiagram) {
      // Get or create a default project ID
      let defaultProjectId = localStorage.getItem('defaultProjectId');
      if (!defaultProjectId) {
        defaultProjectId = 'default';
        localStorage.setItem('defaultProjectId', defaultProjectId);
      }
      
      const language = oldLanguage || 'cpp';
      
      // Migrate to new format
      if (oldCode) {
        saveCode(defaultProjectId, language, oldCode);
        localStorage.removeItem('editorCode');
      }
      
      if (oldDiagram) {
        saveMermaidDiagram(defaultProjectId, oldDiagram);
        localStorage.removeItem('mermaidDiagram');
      }
      
      if (oldLanguage) {
        localStorage.removeItem('editorLanguage');
      }
      
      console.log('Migrated old localStorage format to new format');
    }
  } catch (error) {
    console.error('Failed to migrate old storage:', error);
  }
}

/**
 * Debounced save function
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSaveCode(
  projectId: string,
  language: string,
  code: string,
  delay: number = 300
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveCode(projectId, language, code);
  }, delay);
}

export function debouncedSaveMermaid(
  projectId: string,
  diagram: string,
  title?: string,
  delay: number = 300
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveMermaidDiagram(projectId, diagram, title);
  }, delay);
}
