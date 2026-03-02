import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ProblemStatement from "./components/ProblemStatement";
import ProblemStatementModal from "./components/ProblemStatementModal";
import CodeEditor from "./components/CodeEditor";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import HintsPanel from "./components/HintsPanel";
import DiagramViewer from "./components/DiagramViewer";
import ThemeProvider from "./components/ThemeProvider";
import Footer from "./components/Footer";

function App() {
  const [problemStatement, setProblemStatement] = useState("Write a program to print fibonacci series");
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}`);
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [intuition, setIntuition] = useState("");
  const [diagram, setDiagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "hints" | "intuition">("output");
  const [hintsActiveTab, setHintsActiveTab] = useState<"hints" | "intuition">("hints");
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Initialize theme to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Load saved editor state from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem("editorCode");
    const savedLanguage = localStorage.getItem("editorLanguage");
    const savedDiagram = localStorage.getItem("mermaidDiagram");

    if (savedCode) {
      setCode(savedCode);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedDiagram) {
      setDiagram(savedDiagram);
    }
  }, []);

  // Save code to localStorage whenever it changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("editorCode", code);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [code]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("editorLanguage", language);
  }, [language]);

  // Save diagram to localStorage whenever it changes
  useEffect(() => {
    if (diagram) {
      localStorage.setItem("mermaidDiagram", diagram);
    }
  }, [diagram]);

  const handleRunCode = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";

      // If language is 'cpp', change it to 'c++'
      let submitLanguage = language;
      if (submitLanguage === "cpp") {
        submitLanguage = "c++";
      }

      const response = await fetch(`${apiUrl}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: submitLanguage, input }),
      });
      const data = await response.json();
      setOutput(data.output || data.error || "No output");
      setActiveTab("output");
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/ai/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatement, code }),
      });
      const data = await response.json();

      setHints([...hints, data.content || "No hint available"]);
      setHintsActiveTab("hints");
    } catch (error) {
      setHints([...hints, `Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetIntuition = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/ai/intuition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatement }),
      });
      const data = await response.json();
      setIntuition(data.content || "No intuition available");
      setHintsActiveTab("intuition");
    } catch (error) {
      setIntuition(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/diagram/mermaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, existingDiagram: diagram }),
      });
      const data = await response.json();

      setDiagram(data.mermaid || "No diagram available");
    } catch (error) {
      setDiagram(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHints = () => {
    setHints([]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-5">
          <div className="space-y-4">
            {/* Problem Statement Section */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
              <ProblemStatement
                value={problemStatement}
                onChange={setProblemStatement}
                onViewProblem={() => setShowProblemModal(true)}
              />
            </section>

            {/* Main Content Grid */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Panel - Code Editor */}
                <div className="lg:col-span-2">
                  <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onRunCode={handleRunCode}
                    onGetHint={handleGetHint}
                    onGetIntuition={handleGetIntuition}
                    onGenerateDiagram={handleGenerateDiagram}
                    loading={loading}
                  />
                </div>

                {/* Right Panel - Input, Output & Hints */}
                <div className="space-y-3">
                  <InputPanel input={input} setInput={setInput} />
                  <OutputPanel output={output} activeTab={activeTab} setActiveTab={setActiveTab} />
                  <HintsPanel
                    hints={hints}
                    intuition={intuition}
                    activeTab={hintsActiveTab}
                    setActiveTab={setHintsActiveTab}
                    onClearHints={handleClearHints}
                  />
                </div>
              </div>
            </section>

            {/* Diagram Section */}
            {diagram && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DiagramViewer diagram={diagram} onRegenerate={handleGenerateDiagram} loading={loading} />
              </section>
            )}

            
          </div>
        </main>

        {/* Problem Statement Modal */}
        <ProblemStatementModal
          isOpen={showProblemModal}
          onClose={() => setShowProblemModal(false)}
          problemStatement={problemStatement}
        />

        <Footer />
      </div>

    
    </ThemeProvider>
  );
}

export default App;
