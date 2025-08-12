import React from 'react';
import { 
  StickyNote, 
  Image, 
  Video, 
  Music, 
  Sticker, 
  Trash2, 
  Download,
  Upload,
  Heart,
  Sparkles,
  Tag,
  FileText,
  Maximize2,
  Lock
} from 'lucide-react';
import { ElementType } from '../types';

interface ToolbarProps {
  isAddingElement: ElementType | null;
  onAddElement: (type: ElementType | null) => void;
  onShowMediaUpload: () => void;
  onClearCanvas: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isAddingElement,
  onAddElement,
  onShowMediaUpload,
  onClearCanvas
}) => {
  const tools = [
    {
      type: 'note' as ElementType,
      icon: StickyNote,
      label: 'Add Note',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      type: 'label' as ElementType,
      icon: Tag,
      label: 'Add Label',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'textEditor' as ElementType,
      icon: FileText,
      label: 'Rich Text',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'expandableNote' as ElementType,
      icon: Maximize2,
      label: 'Expandable Note',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      type: 'protectedNote' as ElementType,
      icon: Lock,
      label: 'Protected Note',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      type: 'sticker' as ElementType,
      icon: Heart,
      label: 'Add Sticker',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  const actions = [
    {
      icon: Image,
      label: 'Add Media',
      action: onShowMediaUpload,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Trash2,
      label: 'Clear All',
      action: onClearCanvas,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-pink-100 p-3">
        <div className="flex items-center space-x-2">
          {/* Tool Buttons */}
          <div className="flex items-center space-x-2 max-w-4xl overflow-x-auto">
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onAddElement(isAddingElement === tool.type ? null : tool.type)}
                className={`
                  relative w-12 h-12 rounded-xl text-white transition-all duration-200 transform hover:scale-105 flex-shrink-0
                  ${isAddingElement === tool.type 
                    ? `${tool.color} scale-105 shadow-lg` 
                    : `${tool.color} shadow-md`
                  }
                `}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5 mx-auto" />
                {isAddingElement === tool.type && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-200 mx-2" />

          {/* Action Buttons */}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`
                w-12 h-12 rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-md
                ${action.color}
              `}
              title={action.label}
            >
              <action.icon className="w-5 h-5 mx-auto" />
            </button>
          ))}

          <div className="w-px h-8 bg-gray-200 mx-2" />

          {/* Sparkles Decoration */}
          <div className="flex items-center space-x-1 px-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-gray-600">Memories</span>
          </div>
        </div>

        {/* Instructions */}
        {isAddingElement && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {isAddingElement === 'note' && 'Click anywhere to add a sticky note'}
              {isAddingElement === 'label' && 'Click anywhere to add a label'}
              {isAddingElement === 'textEditor' && 'Click anywhere to add a rich text editor'}
              {isAddingElement === 'expandableNote' && 'Click anywhere to add an expandable note'}
              {isAddingElement === 'protectedNote' && 'Click anywhere to add a protected note'}
              {isAddingElement === 'sticker' && 'Click anywhere to add a sticker'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};