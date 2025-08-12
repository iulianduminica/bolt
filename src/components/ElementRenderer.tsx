import React, { useState, useRef, useCallback } from 'react';
import { MemoryElement } from '../types';
import { X, Move, Edit3, Heart, Star, Music, Lock, Unlock, RotateCw, Play, Maximize2 } from 'lucide-react';
import { PasswordModal } from './PasswordModal';

interface ElementRendererProps {
  element: MemoryElement;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onResizeStart: (event: React.MouseEvent, handle: string) => void;
  onRotateStart: (event: React.MouseEvent) => void;
  onUpdate: (updates: Partial<MemoryElement>) => void;
  onDelete: () => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = useCallback(() => {
    if (element.type === 'protectedNote' && element.isLocked) {
      setShowPasswordModal(true);
      return;
    }
    setIsEditing(true);
    setEditContent(element.content);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [element.content, element.type, element.isLocked]);

  const handleSave = useCallback(() => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  }, [editContent, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && element.type !== 'textEditor') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(element.content);
    }
  }, [handleSave, element.content, element.type]);

  const handlePasswordSubmit = useCallback((password: string) => {
    // Simple client-side hashing (not secure for production)
    const hash = btoa(password);
    if (hash === element.metadata?.passwordHash) {
      onUpdate({ isLocked: false });
      setShowPasswordModal(false);
      setIsEditing(true);
      setEditContent(element.content);
    } else {
      alert('Incorrect password');
    }
  }, [element.metadata?.passwordHash, element.content, onUpdate]);

  const handleExpand = useCallback(() => {
    if (element.type === 'expandableNote') {
      const newExpanded = !element.isExpanded;
      const newSize = newExpanded 
        ? element.metadata?.expandedSize || { width: 400, height: 300 }
        : element.metadata?.collapsedSize || { width: 200, height: 100 };
      
      onUpdate({ 
        isExpanded: newExpanded,
        size: newSize
      });
    }
  }, [element.type, element.isExpanded, element.metadata, onUpdate]);

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

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

      case 'label':
        return (
          <div className="w-full h-full flex items-center justify-center font-semibold text-center">
            {element.content || 'Label'}
          </div>
        );

      case 'textEditor':
        return (
          <div className="w-full h-full p-2 border border-gray-200 rounded bg-white overflow-auto">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full h-full resize-none border-none outline-none"
                placeholder="Rich text content..."
              />
            ) : (
              <div
                className="w-full h-full cursor-text"
                onClick={handleEdit}
                dangerouslySetInnerHTML={{ __html: element.content || 'Click to edit rich text...' }}
              />
            )}
          </div>
        );

      case 'expandableNote':
        return (
          <div 
            className={`w-full h-full p-3 cursor-pointer transition-all duration-300 ${
              element.isExpanded ? 'bg-blue-50 border-2 border-blue-200' : 'bg-yellow-100 border border-yellow-300'
            }`}
            onClick={handleExpand}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                {element.isExpanded ? 'Click to collapse' : 'Click to expand'}
              </span>
              <Maximize2 className={`w-3 h-3 text-gray-400 transition-transform ${element.isExpanded ? 'rotate-180' : ''}`} />
            </div>
            <div className={`whitespace-pre-wrap break-words ${element.isExpanded ? '' : 'line-clamp-3'}`}>
              {element.content || 'Expandable note content...'}
            </div>
          </div>
        );

      case 'protectedNote':
        return element.isLocked ? (
          <div 
            className="w-full h-full bg-gray-100 border-2 border-gray-300 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setShowPasswordModal(true)}
          >
            <Lock className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-sm text-gray-600">Protected Note</span>
            <span className="text-xs text-gray-400">Click to unlock</span>
          </div>
        ) : (
          <div className="w-full h-full p-3 bg-red-50 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <Unlock className="w-4 h-4 text-red-500" />
              <button
                onClick={() => onUpdate({ isLocked: true })}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Lock
              </button>
            </div>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full h-full resize-none border-none outline-none bg-transparent"
              />
            ) : (
              <div
                className="w-full h-full cursor-text whitespace-pre-wrap break-words"
                onClick={handleEdit}
              >
                {element.content || 'Protected content...'}
              </div>
            )}
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
      case 'youtube':
        const videoId = element.metadata?.url ? getYouTubeVideoId(element.metadata.url) : null;
        
        if (isPlayingVideo && videoId) {
          return (
            <div className="relative w-full h-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                className="w-full h-full rounded-inherit"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayingVideo(false);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return (
          <div 
            className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 text-white flex flex-col items-center justify-center rounded-inherit cursor-pointer relative overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
              if (videoId) {
                setIsPlayingVideo(true);
              } else if (element.metadata?.url) {
                window.open(element.metadata.url, '_blank');
              }
            }}
          >
            {element.metadata?.customThumbnailUrl || (videoId && element.content !== element.metadata?.url) ? (
              <img
                src={element.metadata?.customThumbnailUrl || element.content}
                alt={element.metadata?.title || 'YouTube Video'}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <>
                <Play className="w-12 h-12 mb-2 opacity-80" />
                <p className="text-sm font-medium text-center line-clamp-2 px-2">
                  {element.metadata?.title || 'YouTube Video'}
                </p>
                <p className="text-xs opacity-75 mt-1">Click to play</p>
              </>
            )}
            
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-16 h-16 text-white/80" />
            </div>
          </div>
        );

      default:
        return <div>Unknown element type</div>;
    }
  };

  const stickerEmojis = ['❤️', '💕', '🌟', '✨', '🌈', '🦄', '🌸', '🎉', '💖', '🥰', '😍', '🔥', '💯', '🎈', '🍀', '🌺'];

  const resizeHandles = [
    { position: 'nw', cursor: 'nw-resize', className: '-top-1 -left-1' },
    { position: 'n', cursor: 'n-resize', className: '-top-1 left-1/2 -translate-x-1/2' },
    { position: 'ne', cursor: 'ne-resize', className: '-top-1 -right-1' },
    { position: 'e', cursor: 'e-resize', className: 'top-1/2 -translate-y-1/2 -right-1' },
    { position: 'se', cursor: 'se-resize', className: '-bottom-1 -right-1' },
    { position: 's', cursor: 's-resize', className: '-bottom-1 left-1/2 -translate-x-1/2' },
    { position: 'sw', cursor: 'sw-resize', className: '-bottom-1 -left-1' },
    { position: 'w', cursor: 'w-resize', className: 'top-1/2 -translate-y-1/2 -left-1' }
  ];

  return (
    <>
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
          transform: `rotate(${element.rotation || 0}deg)`,
          zIndex: isSelected ? 1000 : 1
        }}
        onMouseDown={onMouseDown}
        data-rotation={element.rotation || 0}
      >
        {renderContent()}

        {/* Selection Controls */}
        {isSelected && (
          <>
            {/* Resize Handles */}
            {resizeHandles.map((handle) => (
              <div
                key={handle.position}
                className={`absolute w-3 h-3 bg-pink-500 rounded-full opacity-80 hover:opacity-100 transition-opacity ${handle.className}`}
                style={{ cursor: handle.cursor }}
                onMouseDown={(e) => onResizeStart(e, handle.position)}
              />
            ))}

            {/* Rotation Handle */}
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-grab hover:cursor-grabbing opacity-80 hover:opacity-100 transition-opacity -top-6 left-1/2 -translate-x-1/2"
              onMouseDown={onRotateStart}
              title="Rotate"
            >
              <RotateCw className="w-3 h-3 text-white m-0.5" />
            </div>

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

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onSubmit={handlePasswordSubmit}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
};