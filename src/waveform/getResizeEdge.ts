import { Range } from "../types/Range";

export type ResizeEdge = 'start' | 'end';
export const RESIZE_EDGE_WIDTH = 10; // in pixels

export const getResizeEdge = (range: Range, offset: number): ResizeEdge | null => {
  if (range) {
    // Check if near start edge
    if (Math.abs(offset - range.start) <= RESIZE_EDGE_WIDTH) {
      return 'start';
    }
    // Check if near end edge
    if (Math.abs(offset - range.end) <= RESIZE_EDGE_WIDTH) {
      return 'end';
    }
  }

  return null;
};
