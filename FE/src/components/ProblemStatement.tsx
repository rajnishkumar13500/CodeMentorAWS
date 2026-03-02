import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Copy, RotateCcw, Eye } from "lucide-react";

interface ProblemStatementProps {
  value: string;
  onChange: (value: string) => void;
  onViewProblem?: () => void;
}

export default function ProblemStatement({ value, onChange, onViewProblem }: ProblemStatementProps) {
  const [copied, setCopied] = useState(false);
  const [initialValue] = useState(value);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onChange(initialValue);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Problem Statement</CardTitle>
          <div className="flex gap-1.5">
            {onViewProblem && (
              <Button
                onClick={onViewProblem}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="View problem statement"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Copy problem statement"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Reset to initial problem"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Compact content spacing */}
      <CardContent className="pt-0 pb-2 px-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-28 p-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          placeholder="Enter the problem statement..."
        />
        <div className="mt-0.5 text-[11px] text-muted-foreground text-right">
          {value.length} characters
        </div>
      </CardContent>
    </Card>
  );
}
