import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Copy, Download } from "lucide-react";

interface OutputPanelProps {
  output: string;
  activeTab: string;
  setActiveTab: (tab: "output" | "hints" | "intuition") => void;
}

export default function OutputPanel({ output, activeTab, setActiveTab }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([output], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "output.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isError = output && (output.includes("Error") || output.includes("error"));

  return (
    <div className="p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Program Output</h3>
        {output && (
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              title="Copy output"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              title="Download output"
            >
              <Download className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className={`bg-background text-foreground p-4 rounded-lg font-mono text-sm min-h-[8rem] max-h-[16rem] overflow-auto whitespace-pre-wrap break-words border ${isError ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : 'border-border'
        }`}>
        {output || (
          <span className="text-muted-foreground text-sm">
            Run your code to see the output here...
          </span>
        )}
      </div>

      {output && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Lines: {output.split("\n").length}</span>
          <span>Characters: {output.length}</span>
          {isError && <span className="text-red-600 dark:text-red-400 font-medium">⚠ Error detected</span>}
        </div>
      )}
    </div>
  );
}
