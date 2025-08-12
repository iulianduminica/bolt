import React, { useState, useRef } from 'react';
import { X, Upload, Image, Video, Music, Link, Heart } from 'lucide-react';
import { MemoryElement } from '../types';

interface MediaUploadProps {
  onUpload: (element: Omit<MemoryElement, 'id'>) => void;
  onClose: () => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onUpload, onClose }) => {
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        let type: 'image' | 'video' | 'gif' = 'image';
        
        if (file.type.startsWith('video/')) {
          type = 'video';
        } else if (file.name.toLowerCase().includes('.gif')) {
          type = 'gif';
        }

        onUpload({
          type,
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          content,
          metadata: {
            title: title || file.name,
            description: description,
            timestamp: new Date().toISOString()
          },
          style: {
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) return;

    let type: 'image' | 'video' | 'music' | 'gif' = 'image';
    let size = { width: 300, height: 200 };
    let processedUrl = url.trim();

    // Handle YouTube URLs
    if (processedUrl.includes('youtube.com') || processedUrl.includes('youtu.be')) {
      type = 'music';
      size = { width: 320, height: 180 };
      
      // Extract video ID and create thumbnail
      let videoId = '';
      if (processedUrl.includes('youtube.com/watch?v=')) {
        videoId = processedUrl.split('v=')[1]?.split('&')[0];
      } else if (processedUrl.includes('youtu.be/')) {
        videoId = processedUrl.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        processedUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } else if (processedUrl.includes('.mp4') || processedUrl.includes('.webm') || processedUrl.includes('.mov')) {
      type = 'video';
    } else if (processedUrl.includes('.gif') || processedUrl.includes('giphy.com') || processedUrl.includes('tenor.com')) {
      type = 'gif';
      size = { width: 250, height: 250 };
      
      // Handle Giphy URLs
      if (processedUrl.includes('giphy.com/gifs/')) {
        const gifId = processedUrl.split('/gifs/')[1]?.split('-').pop();
        if (gifId) {
          processedUrl = `https://media.giphy.com/media/${gifId}/giphy.gif`;
        }
      }
      // Handle Tenor URLs
      else if (processedUrl.includes('tenor.com/view/')) {
        // For Tenor, we'll use the direct URL as provided
        // Users should provide the direct .gif URL from Tenor
      }
    }

    onUpload({
      type,
      position: { x: 100, y: 100 },
      size,
      content: processedUrl,
      metadata: {
        title: title || 'Media',
        description: description,
        timestamp: new Date().toISOString(),
        url: url.trim(),
        isEmbedded: type === 'music'
      },
      style: {
        borderRadius: 12,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    });

    setUrl('');
    setTitle('');
    setDescription('');
  };

  const presetImages = [
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Add Media</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver 
                ? 'border-pink-400 bg-pink-50' 
                : 'border-gray-300 hover:border-pink-300 hover:bg-pink-25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">Drop files here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Choose Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              className="hidden"
            />
          </div>

          {/* URL Input */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-gray-400" />
              <h3 className="font-medium text-gray-700">Add from URL</h3>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Images: Direct image URLs (.jpg, .png, .webp)</p>
              <p>• GIFs: Giphy, Tenor, or direct .gif URLs</p>
              <p>• Videos: YouTube, Vimeo, or direct video URLs</p>
            </div>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Paste image, GIF, video, or YouTube URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!url.trim()}
                className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Media
              </button>
            </div>
          </div>

          {/* Preset Images */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-gray-400" />
              <h3 className="font-medium text-gray-700">Quick Add Media</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {presetImages.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => onUpload({
                    type: 'image',
                    position: { x: 100 + index * 20, y: 100 + index * 20 },
                    size: { width: 250, height: 180 },
                    content: imageUrl,
                    metadata: {
                      title: `Beautiful Memory ${index + 1}`,
                      timestamp: new Date().toISOString()
                    },
                    style: {
                      borderRadius: 12,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }
                  })}
                  className="aspect-video rounded-lg overflow-hidden hover:scale-105 transition-transform"
                >
                  <img
                    src={imageUrl}
                    alt={`Preset ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              
              {/* Sample GIFs */}
              <button
                onClick={() => onUpload({
                  type: 'gif',
                  position: { x: 120, y: 120 },
                  size: { width: 200, height: 200 },
                  content: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
                  metadata: {
                    title: 'Heart GIF',
                    timestamp: new Date().toISOString()
                  },
                  style: {
                    borderRadius: 12,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }
                })}
                className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform bg-pink-100 flex items-center justify-center"
              >
                <div className="text-center">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-1" />
                  <span className="text-xs text-pink-600">Sample GIF</span>
                </div>
              </button>
              
              <button
                onClick={() => onUpload({
                  type: 'youtube',
                  position: { x: 140, y: 140 },
                  size: { width: 320, height: 180 },
                  content: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                  metadata: {
                    title: 'Sample YouTube Video',
                    description: 'Click to watch on YouTube',
                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    timestamp: new Date().toISOString(),
                    isEmbedded: false
                  },
                  style: {
                    borderRadius: 12,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }
                })}
                className="aspect-video rounded-lg overflow-hidden hover:scale-105 transition-transform bg-red-100 flex items-center justify-center"
              >
                <div className="text-center">
                  <Music className="w-8 h-8 text-red-500 mx-auto mb-1" />
                  <span className="text-xs text-red-600">YouTube</span>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Thumbnail Upload */}
          {url && (url.includes('youtube.com') || url.includes('youtu.be')) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-gray-400" />
                <h3 className="font-medium text-gray-700">Custom Thumbnail (Optional)</h3>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const customThumbnail = event.target?.result as string;
                      // You can store this in a state variable to use when creating the element
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">Upload a custom thumbnail image for this YouTube video</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};