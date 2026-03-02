import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Maximize2, X } from "lucide-react";

interface ProblemStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemStatement: string;
}

export default function ProblemStatementModal({ isOpen, onClose, problemStatement }: ProblemStatementModalProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        onClose();
      }
    }
  };

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-background flex flex-col"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground">Problem Statement</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              title="Exit fullscreen"
            >
              <X className="w-4 h-4 mr-1" />
              Exit Fullscreen
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-input border border-border rounded-lg p-8 min-h-full">
              <p className="text-foreground whitespace-pre-wrap break-words text-lg leading-relaxed">
                {problemStatement}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-t border-border bg-card text-center text-sm text-muted-foreground">
          <p>Press ESC to exit fullscreen or close the modal</p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] h-[90vh] flex flex-col border-0 p-0 max-w-none">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Problem Statement</DialogTitle>
            <Button
              onClick={() => setIsFullscreen(true)}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              title="View in fullscreen"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Fullscreen
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="bg-input border border-border rounded-lg p-6 min-h-full">
            <p className="text-foreground whitespace-pre-wrap break-words text-base leading-relaxed">
              {problemStatement}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
