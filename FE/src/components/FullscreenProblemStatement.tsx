import React, { useEffect } from "react";
import { Button } from "./ui/Button";
import { X } from "lucide-react";

interface FullscreenProblemStatementProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
}

export default function FullscreenProblemStatement({ 
  isOpen, 
  onClose, 
  question 
}: FullscreenProblemStatementProps) {
  
  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "unset";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lineCount = question.split("\n").length;
  const charCount = question.length;
  const wordCount = question.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Problem Statement</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Lines: {lineCount}</span>
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Close fullscreen"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          {question ? (
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground">
                {question}
              </pre>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No problem statement provided yet
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Add a problem statement to help the AI provide better hints and intuition
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer helper */}
      <div className="p-3 border-t border-border bg-card text-center text-xs text-muted-foreground">
        Press ESC to exit fullscreen
      </div>
    </div>
  );
}
