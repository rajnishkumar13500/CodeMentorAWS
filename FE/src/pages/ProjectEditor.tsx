import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeProvider from '../components/ThemeProvider';
import CodeEditor from '../components/CodeEditor';
import DiagramViewer from '../components/DiagramViewer';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import HintsPanel from '../components/HintsPanel';
import FullscreenProblemStatement from '../components/FullscreenProblemStatement';
import { ModernDrawer } from '../components/ui/ModernDrawer';
import { LANGUAGE_SNIPPETS } from '../lib/language-snippets';
import { saveCode, saveMermaidDiagram } from '../utils/storage';
import { ArrowLeft, LayoutDashboard, Maximize2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [code, setCodeState] = useState('');
  const [language, setLanguageState] = useState('');
  const [diagram, setDiagramState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Panels state
  const [input, setInputState] = useState('');
  const [output, setOutput] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [intuition, setIntuition] = useState('');
  const [activeTab, setActiveTab] = useState<'output' | 'hints' | 'intuition'>('output');
  const [hintsActiveTab, setHintsActiveTab] = useState<'hints' | 'intuition'>('hints');
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState('');
  const [isQuestionFullscreen, setIsQuestionFullscreen] = useState(false);

  // Drawer states
  const [isDiagramDrawerOpen, setIsDiagramDrawerOpen] = useState(false);
  const [isOutputDrawerOpen, setIsOutputDrawerOpen] = useState(false);

  // Language change dialog
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [showLanguageWarning, setShowLanguageWarning] = useState(false);

  // For input localStorage
  const inputKey = (id: string, lang: string) => `projectInput_${id}_${lang}`;

  // On mount: LOAD FROM BACKEND ONLY (never localStorage)
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/project`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(all => {
        const found = all.find((p: any) => p._id === id);
        if (!found) {
          setError('Project not found.');
          setLoading(false);
          return;
        }
        setProject(found);
        setLanguageState(found.language);
        setCodeState(found.code || LANGUAGE_SNIPPETS[found.language] || '');
        setInputState(found.input || '');
        setDiagramState(found.diagram || '');
        setQuestion(found.question || '');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [id]);

  // On code/input/diagram change, update localStorage for fast local recovery
  const handleCodeChange = (val: string) => {
    setCodeState(val);
    if (project?._id && language) saveCode(project._id, language, val);
  };
  const handleInputChange = (val: string) => {
    setInputState(val);
    if (project?._id && language) localStorage.setItem(inputKey(project._id, language), val);
  };
  const handleDiagramChange = (val: string) => {
    setDiagramState(val);
    if (project?._id) saveMermaidDiagram(project._id, val);
  };
  const handleQuestionChange = (val: string) => {
    setQuestion(val);
  };

  // Language change logic with confirmation and snippet swap
  const setLanguageAndSyncName = (newLang: string) => {
    if (code.trim().length > 0 && code !== LANGUAGE_SNIPPETS[language]) {
      setPendingLanguage(newLang);
      setShowLanguageWarning(true);
    } else {
      performLanguageChange(newLang);
    }
  };
  const performLanguageChange = (newLang: string) => {
    setLanguageState(newLang);
    if (project) {
      const nameBase = project.name.replace(/\s*\[[^\]]+\]$/, '');
      setProject({ ...project, name: `${nameBase} [${newLang}]`, language: newLang });
    }
    setCodeState(LANGUAGE_SNIPPETS[newLang] || '');
    setShowLanguageWarning(false);
    setPendingLanguage(null);
  };

  // Manual Save or Compile PATCH to backend
  const saveToBackend = async () => {
    if (!project || !project._id) {
      console.error('Not saving, project or project._id missing');
      return;
    }
    setSaving(true);
    try {
      const reqBody = {
        code,
        input,
        diagram,
        language,
        name: project.name,
        question
      };
      const token = localStorage.getItem('token');
      const resp = await fetch(`${BACKEND_URL}/project/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reqBody)
      });
      if (!resp.ok) {
        const msg = await resp.text();
        console.error('Error saving project:', msg);
        alert("Failed to save project: " + msg);
      }
    } catch (err) {
      console.error('Network error saving project:', err);
      alert("Could not save project. Please check connection and server.");
    } finally {
      setSaving(false);
    }
  };

  // Compile button logic (Run code)
  const handleRunCode = async () => {
    setLoading(true);
    setIsOutputDrawerOpen(true); // Open drawer immediately to show loading state
    await saveToBackend();
    try {
      let submitLanguage = language;
      if (submitLanguage === 'cpp') submitLanguage = 'c++';
      const response = await fetch(`${BACKEND_URL}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: submitLanguage, input })
      });
      const data = await response.json();
      setOutput(data.output || data.error || 'No output');
      setActiveTab('output');
      if (data.mermaid) handleDiagramChange(data.mermaid);
    } catch (error) {
      setOutput('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Hints, Intuition, Diagram APIs (unchanged)
  const handleGetHint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/ai/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatement: question || project?.name || '', code })
      });
      const data = await response.json();
      setHints([...hints, data.content || 'No hint available']);
      setHintsActiveTab('hints');
    } catch (error: any) {
      setHints([...hints, `Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };
  const handleGetIntuition = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/ai/intuition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatement: question || project?.name || '' })
      });
      const data = await response.json();
      setIntuition(data.content || 'No intuition available');
      setHintsActiveTab('intuition');
    } catch (error: any) {
      setIntuition(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateDiagram = async () => {
    setLoading(true);
    setIsDiagramDrawerOpen(true); // Open drawer immediately
    try {
      const response = await fetch(`${BACKEND_URL}/diagram/mermaid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, existingDiagram: diagram })
      });
      const data = await response.json();
      handleDiagramChange(data.mermaid || '');
    } catch (error: any) {
      handleDiagramChange('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };
  const handleClearHints = () => setHints([]);
  const handleManualSave = saveToBackend;

  if (loading && !project) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          {/* Enhanced Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-4">
                {project && (
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-foreground">
                      {project.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Auto-save enabled</span>
                </div>
                {saving && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-sm">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-orange-700 dark:text-orange-300">Saving...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {project && (
              <>
                {/* Enhanced Problem Statement Section */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Problem Statement</h2>
                      <p className="text-sm text-muted-foreground">Describe what you're trying to solve</p>
                    </div>
                    <button
                      onClick={() => setIsQuestionFullscreen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-all"
                      title="View in fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Fullscreen
                    </button>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Enter your problem statement or question here. The AI will use this to provide hints and intuition..."
                    className="w-full px-4 py-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                    rows={4}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>💡 Tip: Be specific about your problem for better AI assistance</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Lines: {question.split('\n').length}</span>
                      <span>Characters: {question.length}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Main Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Code Editor - Takes 2/3 of the space */}
                  <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <CodeEditor
                        code={code}
                        setCode={handleCodeChange}
                        language={language}
                        setLanguage={setLanguageAndSyncName}
                        onRunCode={handleRunCode}
                        onGetHint={handleGetHint}
                        onGetIntuition={handleGetIntuition}
                        onGenerateDiagram={handleGenerateDiagram}
                        loading={loading}
                        onSave={handleManualSave}
                        saving={saving}
                        showLanguageWarning={showLanguageWarning}
                        pendingLanguage={pendingLanguage}
                        confirmLanguageChange={performLanguageChange}
                        cancelLanguageChange={() => { setShowLanguageWarning(false); setPendingLanguage(null); }}
                      />
                    </div>
                  </div>

                  {/* Right Sidebar - Panels */}
                  <div className="lg:col-span-1 flex flex-col gap-6 h-[600px] lg:h-[750px] overflow-hidden">
                    {/* Input Panel */}
                    <div className="bg-card border border-border rounded-xl shadow-sm shrink-0">
                      <InputPanel input={input} setInput={handleInputChange} />
                    </div>

                    {/* Hints Panel */}
                    <div className="bg-card border border-border rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
                      <HintsPanel
                        hints={hints}
                        intuition={intuition}
                        activeTab={hintsActiveTab}
                        setActiveTab={setHintsActiveTab}
                        onClearHints={handleClearHints}
                      />
                    </div>
                  </div>
                </div>

                {/* Drawers */}
                <ModernDrawer
                  isOpen={isDiagramDrawerOpen}
                  onClose={() => setIsDiagramDrawerOpen(false)}
                  title="Algorithm Visualization"
                  position="right"
                  width="w-full sm:w-[500px] md:w-[700px] lg:w-[900px]"
                >
                  <div className="h-full bg-card rounded-xl border border-border shadow-sm p-4 overflow-hidden flex flex-col">
                    <DiagramViewer diagram={diagram} onRegenerate={handleGenerateDiagram} loading={loading} />
                  </div>
                </ModernDrawer>

                <ModernDrawer
                  isOpen={isOutputDrawerOpen}
                  onClose={() => setIsOutputDrawerOpen(false)}
                  title="Code Execution Output"
                  position="left"
                  width="w-full sm:w-[400px] md:w-[500px]"
                >
                  <div className="h-full">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Compiling and running...</p>
                      </div>
                    ) : (
                      <OutputPanel output={output} activeTab={activeTab} setActiveTab={setActiveTab} />
                    )}
                  </div>
                </ModernDrawer>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Fullscreen Problem Statement */}
      <FullscreenProblemStatement
        isOpen={isQuestionFullscreen}
        onClose={() => setIsQuestionFullscreen(false)}
        question={question}
      />

      {/* Enhanced Language change dialog */}
      {showLanguageWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Change Language?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Changing the language will replace your current code with the template for <span className="font-semibold text-foreground">{pendingLanguage}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowLanguageWarning(false); setPendingLanguage(null); }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (pendingLanguage) performLanguageChange(pendingLanguage); }}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all"
              >
                Replace Code
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
