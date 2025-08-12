import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { MediaUpload } from './components/MediaUpload';
import { ElementPanel } from './components/ElementPanel';
import { MemoryElement, CanvasState, ElementType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Heart } from 'lucide-react';

function App() {
  const [canvasState, setCanvasState] = useLocalStorage<CanvasState>('memory-board', {
    elements: [],
    viewport: { x: 0, y: 0, scale: 1 }
  });
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isAddingElement, setIsAddingElement] = useState<ElementType | null>(null);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = useCallback((element: Omit<MemoryElement, 'id'>) => {
    const newElement: MemoryElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    
    setSelectedElement(newElement.id);
    setIsAddingElement(null);
  }, [setCanvasState]);

  const updateElement = useCallback((id: string, updates: Partial<MemoryElement>) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  }, [setCanvasState]);

  const deleteElement = useCallback((id: string) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    setSelectedElement(null);
  }, [setCanvasState]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!isAddingElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left - canvasState.viewport.x;
    const y = event.clientY - rect.top - canvasState.viewport.y;

    if (isAddingElement === 'note') {
      addElement({
        type: 'note',
        position: { x, y },
        size: { width: 200, height: 100 },
        content: 'Click to edit...',
        style: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontSize: 14,
          padding: 12,
          borderRadius: 8,
          fontFamily: 'Inter',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      });
    } else if (isAddingElement === 'sticker') {
      addElement({
        type: 'sticker',
        position: { x, y },
        size: { width: 80, height: 80 },
        content: '❤️',
        style: {
          fontSize: 48,
          textAlign: 'center' as const,
          cursor: 'pointer',
          borderRadius: 8
        }
      });
    }
  }, [isAddingElement, canvasState.viewport, addElement]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Memory Board
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {canvasState.elements.length} memories
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="pt-20 relative">
        <Canvas
          ref={canvasRef}
          state={canvasState}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          onElementUpdate={updateElement}
          onElementDelete={deleteElement}
          onCanvasClick={handleCanvasClick}
          onViewportChange={(viewport) => 
            setCanvasState(prev => ({ ...prev, viewport }))
          }
        />
      </main>

      {/* Floating Toolbar */}
      <Toolbar
        isAddingElement={isAddingElement}
        onAddElement={setIsAddingElement}
        onShowMediaUpload={() => setShowMediaUpload(true)}
        onClearCanvas={() => {
          if (window.confirm('Are you sure you want to clear all memories?')) {
            setCanvasState({ elements: [], viewport: { x: 0, y: 0, scale: 1 } });
          }
        }}
      />

      {/* Element Properties Panel */}
      {selectedElement && (
        <ElementPanel
          element={canvasState.elements.find(el => el.id === selectedElement)!}
          onUpdate={(updates) => updateElement(selectedElement, updates)}
          onDelete={() => deleteElement(selectedElement)}
          onClose={() => setSelectedElement(null)}
        />
      )}

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload
          onUpload={(element) => {
            addElement(element);
            setShowMediaUpload(false);
          }}
          onClose={() => setShowMediaUpload(false)}
        />
      )}

      {/* Instructions Overlay */}
      {canvasState.elements.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-pink-100 max-w-md mx-4">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Create Your Memory Board</h2>
            <p className="text-gray-600 mb-4">
              Start by adding notes, photos, or stickers to capture your special moments
            </p>
            <div className="text-sm text-gray-500">
              Use the toolbar below to get started ✨
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;