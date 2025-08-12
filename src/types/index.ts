export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  borderRadius?: number;
  border?: string;
  boxShadow?: string;
  opacity?: number;
  cursor?: string;
}

export type ElementType = 'note' | 'label' | 'textEditor' | 'expandableNote' | 'protectedNote' | 'image' | 'video' | 'gif' | 'sticker' | 'music' | 'youtube';

export interface MemoryElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  content: string;
  rotation?: number;
  isExpanded?: boolean;
  isLocked?: boolean;
  style?: ElementStyle;
  metadata?: {
    title?: string;
    description?: string;
    timestamp?: string;
    tags?: string[];
    url?: string;
    thumbnailUrl?: string;
    customThumbnailUrl?: string;
    isEmbedded?: boolean;
    isProtected?: boolean;
    passwordHash?: string;
    pinHash?: string;
    format?: 'html' | 'markdown' | 'plain';
    expandedSize?: Size;
    collapsedSize?: Size;
  };
}

export interface CanvasState {
  elements: MemoryElement[];
  viewport: Viewport;
}

export interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  currentPosition?: Position;
  currentSize?: Size;
  currentRotation?: number;
}