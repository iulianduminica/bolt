import React, { useState, useRef, useCallback } from 'react';
import { MemoryElement } from '../types';
import { X, Move, Edit3, Heart, Star, Music } from 'lucide-react';

interface ElementRendererProps {
  element: MemoryElement;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onUpdate: (updates: Partial<MemoryElement>) => void;
  onDelete: () => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onMouseDown,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(element.content);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [element.content]);

  const handleSave = useCallback(() => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  }, [editContent, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(element.content);
    }
  }, [handleSave, element.content]);

  const renderContent = () => {
    switch (element.type) {
      case 'note':
        return isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none border-none outline-none bg-transparent"
            style={{
              color: element.style?.color,
              fontSize: element.style?.fontSize,
              fontFamily: element.style?.fontFamily,
              padding: 0
            }}
          />
        ) : (
          <div
            className="w-full h-full cursor-text whitespace-pre-wrap break-words"
            onClick={handleEdit}
          >
            {element.content || 'Click to edit...'}
          </div>
        );

      case 'image':
        return (
          <div className="relative w-full h-full overflow-hidden group">
            <img
              src={element.content}
              alt={element.metadata?.title || 'Memory'}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              draggable={false}
            />
            {element.metadata?.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">{element.metadata.title}</p>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <video
            src={element.content}
            controls
            className="w-full h-full object-cover rounded-inherit"
            poster={element.metadata?.thumbnailUrl}
          />
        );

      case 'gif':
        return (
          <img
            src={element.content}
            alt="GIF"
            className="w-full h-full object-cover"
            draggable={false}
          />
        );

      case 'sticker':
        return (
          <div className="w-full h-full flex items-center justify-center text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer select-none">
            {element.content}
          </div>
        );

      case 'music':
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 flex flex-col items-center justify-center rounded-inherit cursor-pointer">
            <Music className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium text-center line-clamp-2">{element.metadata?.title || 'YouTube Video'}</p>
            <p className="text-xs opacity-75 mt-1">Click to watch</p>
            {element.metadata?.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(element.metadata?.url, '_blank');
                }}
                className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
              >
                Watch on YouTube
              </button>
            )}
          </div>
        );

      default:
        return <div>Unknown element type</div>;
    }
  };

  const stickerEmojis = ['❤️', '💕', '🌟', '✨', '🌈', '🦄', '🌸', '🎉', '💖', '🥰', '😍', '🔥', '💯', '🎈', '🍀', '🌺'];

  return (
    <div
      className={`absolute cursor-pointer select-none transition-all duration-200 ${
        isSelected ? 'ring-2 ring-pink-400 ring-offset-2 shadow-lg' : 'hover:shadow-md'
      } ${element.type === 'sticker' ? '' : 'rounded-xl overflow-hidden'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        backgroundColor: element.style?.backgroundColor,
        color: element.style?.color,
        fontSize: element.style?.fontSize,
        fontFamily: element.style?.fontFamily,
        textAlign: element.style?.textAlign,
        padding: element.style?.padding,
        borderRadius: element.style?.borderRadius,
        border: element.style?.border,
        boxShadow: element.style?.boxShadow,
        opacity: element.style?.opacity,
        zIndex: isSelected ? 1000 : 1
      }}
      onMouseDown={onMouseDown}
    >
      {renderContent()}

      {/* Selection Controls */}
      {isSelected && (
        <>
          {/* Resize Handle */}
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-500 rounded-full cursor-se-resize opacity-80 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Resize logic would go here
            }}
          />

          {/* Control Buttons */}
          <div className="absolute -top-8 left-0 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
              title="Edit"
            >
              <Edit3 className="w-3 h-3" />
            </button>

            {element.type === 'sticker' && (
              <div className="relative group">
                <button className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-purple-600 transition-colors">
                  <Star className="w-3 h-3" />
                </button>
                <div className="absolute top-8 left-0 bg-white rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 min-w-[140px]">
                  {stickerEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ content: emoji });
                      }}
                      className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              title="Delete"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};