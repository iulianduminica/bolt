import React, { useState } from 'react';
import { X, Palette, Type, Move, Maximize as Resize, Heart } from 'lucide-react';
import { MemoryElement } from '../types';

interface ElementPanelProps {
  element: MemoryElement;
  onUpdate: (updates: Partial<MemoryElement>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ElementPanel: React.FC<ElementPanelProps> = ({
  element,
  onUpdate,
  onDelete,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'position'>('style');

  const colorPresets = [
    { name: 'Warm Yellow', bg: '#fef3c7', text: '#92400e' },
    { name: 'Soft Pink', bg: '#fce7f3', text: '#be185d' },
    { name: 'Light Blue', bg: '#dbeafe', text: '#1d4ed8' },
    { name: 'Mint Green', bg: '#d1fae5', text: '#065f46' },
    { name: 'Lavender', bg: '#e5e7eb', text: '#374151' },
    { name: 'Peach', bg: '#fed7aa', text: '#9a3412' }
  ];

  const handleColorChange = (bg: string, text: string) => {
    onUpdate({
      style: {
        ...element.style,
        backgroundColor: bg,
        color: text
      }
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    onUpdate({
      size: {
        ...element.size,
        [dimension]: Math.max(50, value)
      }
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...element.position,
        [axis]: value
      }
    });
  };

  const tabs = [
    { id: 'style' as const, label: 'Style', icon: Palette },
    { id: 'content' as const, label: 'Content', icon: Type },
    { id: 'position' as const, label: 'Position', icon: Move }
  ];

  return (
    <div className="fixed right-4 top-24 bottom-24 w-80 bg-white rounded-2xl shadow-2xl border border-pink-100 z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Element Settings</h3>
            <p className="text-xs text-gray-500 capitalize">{element.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'style' && (
          <div className="space-y-6">
            {element.type === 'note' && (
              <>
                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleColorChange(preset.bg, preset.text)}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: preset.bg }}
                        />
                        <span className="text-xs text-gray-600">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={element.style?.fontSize || 14}
                    onChange={(e) => onUpdate({
                      style: {
                        ...element.style,
                        fontSize: parseInt(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{element.style?.fontSize || 14}px</span>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                  <div className="flex space-x-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdate({
                          style: {
                            ...element.style,
                            textAlign: align as 'left' | 'center' | 'right'
                          }
                        })}
                        className={`px-3 py-1 text-sm rounded-lg capitalize transition-colors ${
                          element.style?.textAlign === align
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={element.style?.opacity || 1}
                onChange={(e) => onUpdate({
                  style: {
                    ...element.style,
                    opacity: parseFloat(e.target.value)
                  }
                })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{Math.round((element.style?.opacity || 1) * 100)}%</span>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {element.metadata?.title !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={element.metadata.title || ''}
                  onChange={(e) => onUpdate({
                    metadata: {
                      ...element.metadata,
                      title: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            )}

            {element.metadata?.description !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={element.metadata.description || ''}
                  onChange={(e) => onUpdate({
                    metadata: {
                      ...element.metadata,
                      description: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'position' && (
          <div className="space-y-6">
            {/* Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">X Position</label>
                <input
                  type="number"
                  value={Math.round(element.position.x)}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Y Position</label>
                <input
                  type="number"
                  value={Math.round(element.position.y)}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <input
                  type="number"
                  value={Math.round(element.size.width)}
                  onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="number"
                  value={Math.round(element.size.height)}
                  onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onDelete}
          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete Element
        </button>
      </div>
    </div>
  );
};