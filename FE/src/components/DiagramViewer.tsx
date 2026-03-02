"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  RotateCcw,
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  Eye,
  Code,
  Maximize2,
} from "lucide-react";
import FullscreenDiagram from "./FullscreenDiagram";

// Inline robust MermaidRenderer (no flicker or delay)
function MermaidRenderer({ diagram, zoom }: { diagram: string; zoom: number }) {
  const [svg, setSvg] = useState<string>("");
  const cancelledRef = useRef(false);

  // new ID each time diagram changes to avoid stale defs
  const renderId = useMemo(
    () => `mmd-${Math.random().toString(36).slice(2)}`,
    [diagram]
  );

  useEffect(() => {
    cancelledRef.current = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "neutral",
          maxTextSize: 99999,
          fontFamily: "Arial, sans-serif",
          fontSize: 16,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: "basis"
          },
          sequence: {
            useMaxWidth: false
          },
          gantt: {
            useMaxWidth: false
          }
        });

        const { svg } = await mermaid.render(renderId, diagram);
        if (!cancelledRef.current) setSvg(svg);
      } catch (err: any) {
        // Cleanup orphaned error elements mermaid leaves on the body
        const errorEl = document.getElementById(`d${renderId}`) || document.getElementById(renderId);
        if (errorEl) {
          errorEl.remove();
        }

        if (!cancelledRef.current) {
          setSvg(
            `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="80">
               <text x="8" y="24" font-family="monospace" font-size="14" fill="#b00020">Mermaid render error:</text>
               <text x="8" y="48" font-family="monospace" font-size="12" fill="#b00020">${escapeXml(
                 err?.message || String(err)
               )}</text>
             </svg>`
          );
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [diagram, renderId]);

  const scale = Math.max(0.5, Math.min(2, zoom / 100));

  return (
    <div
      className="relative w-full h-full overflow-auto"
      style={{ minHeight: 200 }}
    >
      <div
        className="origin-top-left inline-block"
        style={{ transform: `scale(${scale})` }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface DiagramViewerProps {
  diagram: string;
  onRegenerate: () => void;
  loading: boolean;
}

export default function DiagramViewer({
  diagram,
  onRegenerate,
  loading,
}: DiagramViewerProps) {
  const [zoom, setZoom] = useState(120);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([diagram], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "diagram.mmd";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 500));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 25));
  const handleResetZoom = () => setZoom(120);

  const isDiagramAvailable = Boolean(diagram && diagram.trim() !== "" && diagram !== "No diagram available");

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Algorithm Diagram</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                onClick={() => setViewMode("visual")}
                variant={viewMode === "visual" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 gap-2 text-xs"
              >
                <Eye className="w-3 h-3" />
                Visual
              </Button>
              <Button
                onClick={() => setViewMode("code")}
                variant={viewMode === "code" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 gap-2 text-xs"
              >
                <Code className="w-3 h-3" />
                Code
              </Button>
            </div>

            <Button
              onClick={onRegenerate}
              disabled={loading}
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
              title="Regenerate diagram"
            >
              <RotateCcw size={16} />
              {loading ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isDiagramAvailable ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-transparent"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {zoom}%
                </span>
                <div className="text-xs text-muted-foreground ml-2">
                  <div>Scroll to zoom</div>
                  <div>Drag to pan</div>
                </div>
                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-transparent"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleResetZoom}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs bg-transparent"
                  title="Reset zoom and position"
                >
                  Reset
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFullscreen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs bg-transparent"
                  title="View in fullscreen"
                >
                  <Maximize2 className="w-3 h-3" />
                  Fullscreen
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs bg-transparent"
                  title="Copy diagram"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs bg-transparent"
                  title="Download diagram"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>

            <div className="bg-input p-6 rounded-lg border border-border min-h-96 overflow-auto">
              {viewMode === "visual" ? (
                <MermaidRenderer key={diagram} diagram={diagram} zoom={zoom} />
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    Diagram Source Code:
                  </div>
                  <pre className="text-xs text-foreground font-mono bg-card p-4 rounded overflow-auto max-h-96">
                    {diagram}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Lines: {diagram.split("\n").length}</span>
              <span>Characters: {diagram.length}</span>
            </div>
          </>
        ) : (
          <div className="bg-input p-12 rounded-lg border border-border flex flex-col items-center justify-center min-h-64 text-center">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              No diagram generated yet
            </p>
            <p className="text-xs text-muted-foreground">
              Click "Generate Diagram" to visualize your algorithm
            </p>
          </div>
        )}
      </CardContent>

      <FullscreenDiagram
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        diagram={diagram}
      />
    </Card>
  );
}
