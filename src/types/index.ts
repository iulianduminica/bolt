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

export type ElementType = 'note' | 'image' | 'video' | 'gif' | 'sticker' | 'music';

export interface MemoryElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  content: string;
  style?: ElementStyle;
  metadata?: {
    title?: string;
    description?: string;
    timestamp?: string;
    tags?: string[];
    url?: string;
    thumbnailUrl?: string;
  };
}

export interface CanvasState {
  elements: MemoryElement[];
  viewport: Viewport;
}