import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  diagram: string;
  zoom?: number;
}

export default function MermaidRenderer({ diagram, zoom = 100 }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!diagram || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    // Detect current theme
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'default';

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      themeVariables: isDark ? {
        primaryColor: '#3b82f6',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#4a5568',
        lineColor: '#e2e8f0',
        secondaryColor: '#2d3748',
        tertiaryColor: '#1a202c',
        background: '#1a202c',
        mainBkg: '#2d3748',
        secondBkg: '#4a5568',
        tertiaryBkg: '#1a202c'
      } : {
        primaryColor: '#3b82f6',
        primaryTextColor: '#333',
        primaryBorderColor: '#666',
        lineColor: '#333',
        secondaryColor: '#f8f9fa',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#f8f9fa',
        secondBkg: '#e9ecef',
        tertiaryBkg: '#ffffff'
      }
    });

    // Clear previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Generate unique ID for this diagram
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create a temporary element to render the diagram
    const tempDiv = document.createElement('div');
    tempDiv.id = id;
    tempDiv.innerHTML = diagram;

    // Render the diagram
    mermaid.render(id, diagram).then(({ svg }) => {
      setIsLoading(false);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        
        // Apply zoom and transform
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = `scale(${currentZoom / 100}) translate(${translate.x}px, ${translate.y}px)`;
          svgElement.style.transformOrigin = 'top left';
          svgElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    }).catch((error) => {
      setIsLoading(false);
      setError(error.message);
      console.error('Mermaid rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #666;">
            <p>Error rendering diagram:</p>
            <pre style="font-size: 12px; color: #999;">${error.message}</pre>
          </div>
        `;
      }
    });
  }, [diagram, currentZoom, translate]);

  // Update zoom when prop changes
  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    const newZoom = Math.max(25, Math.min(300, currentZoom + delta));
    setCurrentZoom(newZoom);
  }, [currentZoom]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  }, [translate]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse leave for dragging
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#666'
      }}>
        <div>Rendering diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#dc2626',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <p>Error rendering diagram:</p>
          <pre style={{ fontSize: '12px', color: '#999' }}>{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: '100%', 
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    />
  );
}
