import { useCallback, useRef } from 'react';
import { MemoryElement } from '../types';

interface UseDragAndDropProps {
  onUpdate: (id: string, updates: Partial<MemoryElement>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDragAndDrop({ onUpdate, onDragStart, onDragEnd }: UseDragAndDropProps) {
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((event: React.MouseEvent, elementId: string) => {
    event.stopPropagation();
    
    isDraggingRef.current = true;
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    
    // Get element's current position
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    elementStartPos.current = { 
      x: parseInt(element.style.left) || 0, 
      y: parseInt(element.style.top) || 0 
    };

    onDragStart?.();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newPosition = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY
      };

      onUpdate(elementId, { position: newPosition });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      onDragEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate, onDragStart, onDragEnd]);

  return { handleMouseDown, isDragging: isDraggingRef.current };
}