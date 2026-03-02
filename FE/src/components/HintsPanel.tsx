import React, { useState } from "react";
import { Button } from "./ui/Button";
import { X, Copy, Lightbulb, Brain, ChevronDown, ChevronUp } from "lucide-react";

import { parseIntuitionText } from "../lib/parseIntuition";

interface HintsPanelProps {
  hints: string[];
  intuition: string;
  activeTab: "hints" | "intuition";
  setActiveTab: (tab: "hints" | "intuition") => void;
  onClearHints: () => void;
}

export default function HintsPanel({ hints, intuition, activeTab, setActiveTab, onClearHints }: HintsPanelProps) {
  const [expandedHints, setExpandedHints] = useState<Set<number>>(new Set());
  const [copiedHint, setCopiedHint] = useState<number | null>(null);

  const toggleHintExpanded = (index: number) => {
    const next = new Set(expandedHints);
    next.has(index) ? next.delete(index) : next.add(index);
    setExpandedHints(next);
  };

  const handleCopyHint = (hint: string, index: number) => {
    navigator.clipboard.writeText(hint);
    setCopiedHint(index);
    setTimeout(() => setCopiedHint(null), 2000);
  };

  const reversedHints = [...hints].reverse();

  return (
    <div className="flex flex-col h-full p-4 md:p-5 space-y-4">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("hints")}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition ${activeTab === "hints"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <Lightbulb className="w-4 h-4" />
            Hints ({hints.length})
          </button>
          <button
            onClick={() => setActiveTab("intuition")}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition ${activeTab === "intuition"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <Brain className="w-4 h-4" />
            Intuition
          </button>
        </div>

        {hints.length > 0 && activeTab === "hints" && (
          <Button
            onClick={onClearHints}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
            title="Clear all hints"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4">
        {activeTab === "hints" ? (
          hints.length > 0 ? (
            reversedHints.map((hint, idx) => {
              const originalIndex = hints.length - 1 - idx;
              const expanded = expandedHints.has(originalIndex);
              return (
                <div
                  key={originalIndex}
                  className="border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden bg-card"
                >
                  <button
                    onClick={() => toggleHintExpanded(originalIndex)}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                          Hint {originalIndex + 1}
                        </div>
                        {!expanded && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                            {hint.substring(0, 60)}...
                          </p>
                        )}
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {expanded && (
                    <div className="p-4 bg-background border-t border-orange-200 dark:border-orange-800">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap mb-4">
                        {hint}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-lg">
              <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-sm text-muted-foreground">
                Click "Get Hint" to receive helpful hints for your problem
              </p>
            </div>
          )
        ) : (
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden bg-card">
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                Understanding the Problem
              </div>
            </div>

            {intuition ? (
              <div className="p-4 space-y-4">
                <div className="text-sm text-foreground leading-relaxed">
                  {parseIntuitionText(intuition)}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-sm text-muted-foreground">
                  Click "Get Intuition" to understand the problem better
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
