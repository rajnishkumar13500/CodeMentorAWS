"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { X, Maximize2, Minimize2, RotateCcw } from "lucide-react";

/* ---------- Mermaid loader (single init across hot reloads) ---------- */

let _mermaidPromise: Promise<any> | null = null;
async function getMermaid() {
  if (!_mermaidPromise) {
    _mermaidPromise = (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "neutral",
        maxTextSize: 1e6,
        fontFamily: "Arial, sans-serif",
        fontSize: 18,
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
      return mermaid;
    })();
  }
  return _mermaidPromise;
}

/* ---------- Small SVG renderer that exposes size for correct centering ---------- */

function useMermaidSvg(diagram: string) {
  const [svg, setSvg] = useState<string>("");
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const renderId = useMemo(() => `mmd-${Math.random().toString(36).slice(2)}`, [diagram]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await getMermaid();
        const { svg } = await mermaid.render(renderId, diagram);
        if (cancelled) return;

        // Extract width/height from the produced SVG
        let w = 0,
          h = 0;
        const wMatch = svg.match(/width="([\d.]+)"/);
        const hMatch = svg.match(/height="([\d.]+)"/);
        if (wMatch) w = parseFloat(wMatch[1]);
        if (hMatch) h = parseFloat(hMatch[1]);

        // Fallback if width/height not present: try viewBox
        if ((!w || !h) && /viewBox="([\d.\s-]+)"/.test(svg)) {
          const vb = (svg.match(/viewBox="([\d.\s-]+)"/) || [])[1];
          if (vb) {
            const parts = vb.split(/\s+/).map(Number);
            if (parts.length === 4) {
              w = parts[2];
              h = parts[3];
            }
          }
        }

        // Final fallback
        if (!w || !h) {
          w = 800;
          h = 600;
        }

        setSvg(svg);
        setSize({ width: w, height: h });
      } catch (err) {
        const errorEl = document.getElementById(`d${renderId}`) || document.getElementById(renderId);
        if (errorEl) errorEl.remove();

        const msg = err instanceof Error ? err.message : String(err);
        const errSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="720" height="120">
            <rect width="100%" height="100%" fill="#fff5f5"/>
            <text x="12" y="36" font-family="monospace" font-size="16" fill="#b00020">Mermaid render error</text>
            <text x="12" y="70" font-family="monospace" font-size="13" fill="#b00020">${escapeXml(msg)}</text>
          </svg>
        `;
        setSvg(errSvg);
        setSize({ width: 720, height: 120 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [diagram, renderId]);

  return { svg, size };
}

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* ---------- Main Fullscreen Diagram Component ---------- */

interface FullscreenDiagramProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: string;
}

export default function FullscreenDiagram({ isOpen, onClose, diagram }: FullscreenDiagramProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { svg, size } = useMermaidSvg(diagram);
  const [scale, setScale] = useState(1); // 0.1 .. 10
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const clampScale = (s: number) => Math.min(10, Math.max(0.1, s));

  // Center diagram on first successful render & when pressing "Fit"
  const fitToCenter = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !size.width || !size.height) return;

    // Compute scale that fits (but not above 2x to avoid giant jumps)
    const sx = vp.clientWidth / (size.width + 32); // generous padding
    const sy = vp.clientHeight / (size.height + 32);
    const fit = Math.min(sx, sy);
    const nextScale = clampScale(Math.min(fit, 2));

    // Center
    const x = (vp.clientWidth - size.width * nextScale) / 2;
    const y = (vp.clientHeight - size.height * nextScale) / 2;

    setScale(nextScale);
    setPan({ x, y });
  }, [size.width, size.height]);

  // Initial lock body scroll / unlock on close
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

  // When diagram or viewport size changes, center it once the SVG is ready
  useLayoutEffect(() => {
    if (!isOpen || !svg) return;
    fitToCenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, svg]);

  // Resize observer to keep it nicely centered on viewport changes
  useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => {
      fitToCenter();
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [fitToCenter]);

  // Buttons
  const onZoomIn = () => setScale((s) => clampScale(s * 1.2));
  const onZoomOut = () => setScale((s) => clampScale(s / 1.2));
  const onReset = () => fitToCenter();

  // Ctrl/Cmd + wheel zoom around cursor, else allow normal scroll = pan
  const onWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();

    const vp = viewportRef.current;
    if (!vp) return;

    // Cursor point in viewport coords
    const vpRect = vp.getBoundingClientRect();
    const px = e.clientX - vpRect.left;
    const py = e.clientY - vpRect.top;

    // Old content scale & pan
    const oldScale = scale;

    // Zoom step
    const direction = Math.sign(e.deltaY);
    const factor = direction > 0 ? 1 / 1.15 : 1.15;
    const newScale = clampScale(oldScale * factor);

    if (newScale === oldScale) return;

    // Keep the point under cursor stable: screen = pan + scale * content
    // Solve for new pan so that the same content point remains at the same screen point.
    const newPanX = px - ((px - pan.x) * newScale) / oldScale;
    const newPanY = py - ((py - pan.y) * newScale) / oldScale;

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // Drag-to-pan (absolute positioning, no scrollbars)
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLDivElement).style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    last.current = { x: e.clientX, y: e.clientY };
  };
  const endDrag = (el?: HTMLDivElement | null) => {
    dragging.current = false;
    last.current = null;
    if (el) el.style.cursor = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Diagram Viewer</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onZoomOut}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Zoom out"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-16 text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button
              onClick={onZoomIn}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Zoom in"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs gap-2"
              title="Fit to screen"
            >
              <RotateCcw className="w-3 h-3" />
              Fit
            </Button>
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

      {/* Viewport (fills screen, no clipping of content; pan/zoom via transform) */}
      <div
        ref={viewportRef}
        className="relative flex-1"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={(e) => endDrag(e.currentTarget)}
        onMouseLeave={(e) => endDrag(e.currentTarget)}
        style={{ cursor: dragging.current ? "grabbing" : "grab", overflow: "hidden" }}
      >
        {/* Content layer (absolute so it can be anywhere, not hidden) */}
        <div
          ref={contentRef}
          className="absolute"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            // helpful minimum padding to keep edges visible
            padding: 16,
            willChange: "transform",
          }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Footer helper */}
      <div className="p-3 border-t border-border bg-card text-center text-xs text-muted-foreground">
        Ctrl/Cmd + Scroll to zoom • Drag to pan • Press ESC to exit
      </div>
    </div>
  );
}
