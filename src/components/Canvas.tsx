import React, { forwardRef, useRef, useState, useCallback } from 'react';
import { CanvasState, MemoryElement, Viewport } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { useCanvasPan } from '../hooks/useCanvasPan';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

interface CanvasProps {
  state: CanvasState;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<MemoryElement>) => void;
  onElementDelete: (id: string) => void;
  onCanvasClick: (event: React.MouseEvent) => void;
  onViewportChange: (viewport: Viewport) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  state,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onCanvasClick,
  onViewportChange
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Canvas panning
  const { handleMouseDown: handlePanStart } = useCanvasPan({
    viewport: state.viewport,
    onViewportChange,
    containerRef
  });

  // Element dragging
  const { handleMouseDown: handleElementDrag, handleResizeStart, handleRotateStart } = useDragAndDrop({
    onUpdate: onElementUpdate,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false)
  });

  const handleMouseDown = useCallback((event: React.MouseEvent, elementId?: string) => {
    if (elementId) {
      handleElementDrag(event, elementId);
      onElementSelect(elementId);
    } else {
      handlePanStart(event);
      onElementSelect(null);
    }
  }, [handleElementDrag, handlePanStart, onElementSelect]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!isDragging) {
      onCanvasClick(event);
    }
  }, [isDragging, onCanvasClick]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    // Reset viewport to center
    onViewportChange({ x: 0, y: 0, scale: 1 });
  }, [onViewportChange]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pt-20 pb-20 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => handleMouseDown(e)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle, #ec4899 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: `${state.viewport.x % 40}px ${state.viewport.y % 40}px`
          }}
        />

        {/* Elements */}
        {state.elements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, element.id);
            }}
            onResizeStart={(e, handle) => {
              e.stopPropagation();
              handleResizeStart(e, element.id, handle);
            }}
            onRotateStart={(e) => {
              e.stopPropagation();
              handleRotateStart(e, element.id);
            }}
            onUpdate={(updates) => onElementUpdate(element.id, updates)}
            onDelete={() => onElementDelete(element.id)}
          />
        ))}

        {/* Selection Indicator */}
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg border border-pink-100">
          Scale: {Math.round(state.viewport.scale * 100)}%
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';