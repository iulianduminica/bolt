import { useCallback, useRef } from 'react';
import { Viewport } from '../types';

interface UseCanvasPanProps {
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function useCanvasPan({ viewport, onViewportChange, containerRef }: UseCanvasPanProps) {
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only handle left mouse button
    
    isDraggingRef.current = true;
    lastMousePos.current = { x: event.clientX, y: event.clientY };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      onViewportChange({
        ...viewport,
        x: viewport.x + deltaX,
        y: viewport.y + deltaY
      });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [viewport, onViewportChange]);

  return { handleMouseDown };
}