import React from "react";

interface InputPanelProps {
  input: string;
  setInput: (input: string) => void;
}

export default function InputPanel({ input, setInput }: InputPanelProps) {
  return (
    <div className="p-4 md:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Program Input</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Enter input data that your program will read (test cases, user input, etc.)
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input for your program here...&#10;&#10;Example:&#10;5&#10;1 2 3 4 5"
          className="w-full h-32 md:h-40 px-4 py-4 text-sm bg-background text-foreground border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-muted-foreground font-mono leading-relaxed"
        />

        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Lines: {input.split('\n').length}</span>
          <span>Characters: {input.length}</span>
        </div>

        {input.length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words max-h-24 overflow-auto">
              {input || 'No input provided'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
