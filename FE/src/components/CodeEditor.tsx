import React, { useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Copy, Download, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "./ThemeProvider";

type LanguageKey = "cpp" | "python" | "java" | "javascript";

interface CodeEditorProps {
  code: string;
  setCode: (val: string) => void;
  language: LanguageKey | string;
  setLanguage: (lang: LanguageKey | string) => void;
  onRunCode: () => void;
  onGetHint: () => void;
  onGetIntuition: () => void;
  onGenerateDiagram: () => void;
  loading: boolean;
  onSave?: () => void;
  saving?: boolean;
  // Dialog/Language change (optional for core usage)
  showLanguageWarning?: boolean;
  pendingLanguage?: LanguageKey | string | null;
  confirmLanguageChange?: (lang: LanguageKey | string) => void;
  cancelLanguageChange?: () => void;
}

const LANGUAGE_CONFIG: Record<string, { name: string; extension: string; monacoLanguage: string }> = {
  cpp: { name: "C++", extension: ".cpp", monacoLanguage: "cpp" },
  python: { name: "Python", extension: ".py", monacoLanguage: "python" },
  java: { name: "Java", extension: ".java", monacoLanguage: "java" },
  javascript: { name: "JavaScript", extension: ".js", monacoLanguage: "javascript" }
};

export default function CodeEditor({
  code,
  setCode,
  language,
  setLanguage,
  onRunCode,
  onGetHint,
  onGetIntuition,
  onGenerateDiagram,
  loading,
  onSave,
  saving,
  showLanguageWarning,
  pendingLanguage,
  confirmLanguageChange,
  cancelLanguageChange
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = () => {
    const config = LANGUAGE_CONFIG[language] || { extension: ".txt" };
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code${config.extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleClear = () => {
    if (window.confirm && window.confirm("Are you sure you want to clear the code?")) setCode("");
  };
  const handleLanguageChange = (newLanguage: string) => setLanguage(newLanguage);
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Theme registration...
    const lightTheme = {
      base: 'vs', inherit: true, rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'dc2626' },
        { token: 'operator', foreground: '7c3aed' },
        { token: 'delimiter', foreground: '374151' },
        { token: 'type', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'function', foreground: '2563eb' },
        { token: 'variable', foreground: '374151' },
        { token: 'constant', foreground: 'dc2626' },
      ], colors: {
        'editor.background': '#e2e8f0', 'editor.foreground': '#374151', 'editorLineNumber.foreground': '#9ca3af', 'editorLineNumber.activeForeground': '#374151',
        'editor.selectionBackground': '#dbeafe', 'editor.selectionHighlightBackground': '#f3f4f6',
        'editorCursor.foreground': '#374151', 'editorWhitespace.foreground': '#d1d5db', 'editorIndentGuide.background': '#d1d5db', 'editorIndentGuide.activeBackground': '#9ca3af',
      }
    };
    const darkTheme = {
      base: 'vs-dark', inherit: true, rules: [
        { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f87171' },
        { token: 'operator', foreground: 'a78bfa' },
        { token: 'delimiter', foreground: 'd1d5db' },
        { token: 'type', foreground: 'a78bfa', fontStyle: 'bold' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'variable', foreground: 'd1d5db' },
        { token: 'constant', foreground: 'f87171' },
      ], colors: {
        'editor.background': '#1e293b', 'editor.foreground': '#f1f5f9', 'editorLineNumber.foreground': '#64748b', 'editorLineNumber.activeForeground': '#f1f5f9',
        'editor.selectionBackground': '#334155', 'editor.selectionHighlightBackground': '#475569',
        'editorCursor.foreground': '#f1f5f9', 'editorWhitespace.foreground': '#475569', 'editorIndentGuide.background': '#475569', 'editorIndentGuide.activeBackground': '#64748b',
      }
    };
    monaco.editor.defineTheme('custom-light', lightTheme);
    monaco.editor.defineTheme('custom-dark', darkTheme);
    monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
    editor.updateOptions({
      fontSize: 14, lineHeight: 24, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true,
      tabSize: 2, insertSpaces: true, wordWrap: 'on', lineNumbers: 'on', glyphMargin: false, folding: true,
      lineDecorationsWidth: 0, lineNumbersMinChars: 3, renderLineHighlight: 'none', selectOnLineNumbers: true,
      roundedSelection: false, readOnly: false, cursorStyle: 'line',
    });
  };
  const handleEditorChange = (value: string | undefined) => { if (value !== undefined) setCode(value); };
  const langConf = LANGUAGE_CONFIG[language] || { name: "Unknown", extension: ".txt", monacoLanguage: "plaintext" };
  const lineCount = code.split("\n").length;

  return (
    <>
      <div className="flex flex-col border border-border bg-card rounded-xl overflow-hidden h-[600px] lg:h-[750px] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-foreground">Code Editor</label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Lines: {lineCount}</span>
              <span>•</span>
              <span>Characters: {code.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Language:</span>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 h-8 bg-background text-foreground border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={!!saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            <Editor
              key={`${theme}-${language}`}
              height="100%"
              language={langConf.monacoLanguage}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme={theme === 'dark' ? 'custom-dark' : 'custom-light'}
              options={{
                fontSize: 15,
                lineHeight: 26,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 4,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                padding: { top: 20, bottom: 20 },
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                overviewRulerLanes: 0
              }}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onRunCode}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium h-9 px-4"
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              onClick={onGetHint}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-medium h-9 px-4"
              disabled={loading}
            >
              Get Hint
            </Button>
            <Button
              onClick={onGetIntuition}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium h-9 px-4"
              disabled={loading}
            >
              Get Intuition
            </Button>
            <Button
              onClick={onGenerateDiagram}
              className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 text-white font-medium h-9 px-4"
              disabled={loading}
            >
              Generate Diagram
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2 h-9 px-3"
              title="Copy code to clipboard"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="gap-2 h-9 px-3"
              title="Download code file"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive h-9 px-3"
              title="Clear all code"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Language Change Dialog */}
      {(showLanguageWarning && confirmLanguageChange && cancelLanguageChange) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Change Language?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Changing the language will replace your current code with the template for the new language. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelLanguageChange} className="bg-gray-200 px-4 py-1 rounded border">Cancel</button>
              <button onClick={() => confirmLanguageChange(pendingLanguage || language)} className="bg-orange-600 text-white px-4 py-1 rounded">Replace Code</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
