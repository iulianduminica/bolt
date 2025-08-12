import { useCallback, useRef } from 'react';
import { MemoryElement, Position, Size } from '../types';

interface UseDragAndDropProps {
  onUpdate: (id: string, updates: Partial<MemoryElement>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDragAndDrop({ onUpdate, onDragStart, onDragEnd }: UseDragAndDropProps) {
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const elementStartSize = useRef({ width: 0, height: 0 });
  const elementStartRotation = useRef(0);
  const currentElementRef = useRef<HTMLElement | null>(null);
  const resizeHandleRef = useRef<string>('');

  const handleMouseDown = useCallback((event: React.MouseEvent, elementId: string) => {
    event.stopPropagation();
    
    isDraggingRef.current = true;
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    
    const element = event.currentTarget as HTMLElement;
    currentElementRef.current = element;
    
    const rect = element.getBoundingClientRect();
    elementStartPos.current = { 
      x: parseInt(element.style.left) || 0, 
      y: parseInt(element.style.top) || 0 
    };

    onDragStart?.();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !currentElementRef.current) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newPosition = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY
      };

      // Update visual position immediately using transform for smooth movement
      currentElementRef.current.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px) rotate(${elementStartRotation.current}deg)`;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current || !currentElementRef.current) return;

      const deltaX = dragStartPos.current.x - event.clientX;
      const deltaY = dragStartPos.current.y - event.clientY;

      const finalPosition = {
        x: elementStartPos.current.x - deltaX,
        y: elementStartPos.current.y - deltaY
      };

      // Commit final position to state
      onUpdate(elementId, { position: finalPosition });

      isDraggingRef.current = false;
      currentElementRef.current = null;
      onDragEnd?.();
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate, onDragStart, onDragEnd]);

  const handleResizeStart = useCallback((event: React.MouseEvent, elementId: string, handle: string) => {
    event.stopPropagation();
    
    isResizingRef.current = true;
    resizeHandleRef.current = handle;
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    
    const element = event.currentTarget.parentElement as HTMLElement;
    currentElementRef.current = element;
    
    elementStartPos.current = { 
      x: parseInt(element.style.left) || 0, 
      y: parseInt(element.style.top) || 0 
    };
    elementStartSize.current = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !currentElementRef.current) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      let newSize = { ...elementStartSize.current };
      let newPosition = { ...elementStartPos.current };

      switch (handle) {
        case 'nw':
          newSize.width = Math.max(50, elementStartSize.current.width - deltaX);
          newSize.height = Math.max(50, elementStartSize.current.height - deltaY);
          newPosition.x = elementStartPos.current.x + deltaX;
          newPosition.y = elementStartPos.current.y + deltaY;
          break;
        case 'ne':
          newSize.width = Math.max(50, elementStartSize.current.width + deltaX);
          newSize.height = Math.max(50, elementStartSize.current.height - deltaY);
          newPosition.y = elementStartPos.current.y + deltaY;
          break;
        case 'sw':
          newSize.width = Math.max(50, elementStartSize.current.width - deltaX);
          newSize.height = Math.max(50, elementStartSize.current.height + deltaY);
          newPosition.x = elementStartPos.current.x + deltaX;
          break;
        case 'se':
          newSize.width = Math.max(50, elementStartSize.current.width + deltaX);
          newSize.height = Math.max(50, elementStartSize.current.height + deltaY);
          break;
        case 'n':
          newSize.height = Math.max(50, elementStartSize.current.height - deltaY);
          newPosition.y = elementStartPos.current.y + deltaY;
          break;
        case 's':
          newSize.height = Math.max(50, elementStartSize.current.height + deltaY);
          break;
        case 'w':
          newSize.width = Math.max(50, elementStartSize.current.width - deltaX);
          newPosition.x = elementStartPos.current.x + deltaX;
          break;
        case 'e':
          newSize.width = Math.max(50, elementStartSize.current.width + deltaX);
          break;
      }

      // Update visual size and position immediately
      currentElementRef.current.style.width = `${newSize.width}px`;
      currentElementRef.current.style.height = `${newSize.height}px`;
      currentElementRef.current.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px) rotate(${elementStartRotation.current}deg)`;
    };

    const handleMouseUp = () => {
      if (!isResizingRef.current || !currentElementRef.current) return;

      const finalSize = {
        width: currentElementRef.current.offsetWidth,
        height: currentElementRef.current.offsetHeight
      };

      const transform = currentElementRef.current.style.transform;
      const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      const finalPosition = translateMatch ? {
        x: parseFloat(translateMatch[1]),
        y: parseFloat(translateMatch[2])
      } : elementStartPos.current;

      // Commit final size and position to state
      onUpdate(elementId, { 
        size: finalSize,
        position: finalPosition
      });

      isResizingRef.current = false;
      currentElementRef.current = null;
      resizeHandleRef.current = '';
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate]);

  const handleRotateStart = useCallback((event: React.MouseEvent, elementId: string) => {
    event.stopPropagation();
    
    isRotatingRef.current = true;
    const element = event.currentTarget.parentElement as HTMLElement;
    currentElementRef.current = element;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    elementStartRotation.current = parseFloat(element.dataset.rotation || '0');

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRotatingRef.current || !currentElementRef.current) return;

      const rect = currentElementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const degrees = (angle * 180 / Math.PI + 90) % 360;
      
      // Update visual rotation immediately
      const currentTransform = currentElementRef.current.style.transform;
      const translateMatch = currentTransform.match(/translate\([^)]+\)/);
      const translatePart = translateMatch ? translateMatch[0] : 'translate(0px, 0px)';
      
      currentElementRef.current.style.transform = `${translatePart} rotate(${degrees}deg)`;
      currentElementRef.current.dataset.rotation = degrees.toString();
    };

    const handleMouseUp = () => {
      if (!isRotatingRef.current || !currentElementRef.current) return;

      const finalRotation = parseFloat(currentElementRef.current.dataset.rotation || '0');

      // Commit final rotation to state
      onUpdate(elementId, { rotation: finalRotation });

      isRotatingRef.current = false;
      currentElementRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate]);

  return { 
    handleMouseDown, 
    handleResizeStart,
    handleRotateStart,
    isDragging: isDraggingRef.current,
    isResizing: isResizingRef.current,
    isRotating: isRotatingRef.current
  };
}