export interface Range {
    start: number;
    end: number;
}

export const drawRange = (canvas: HTMLCanvasElement, range: Range) => {
    const ctx = canvas.getContext('2d')!;

    const { start, end } = range;

    ctx.beginPath();
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 2;

    ctx.moveTo(start, 0);
    ctx.lineTo(start, canvas.height);
    ctx.moveTo(end, 0);
    ctx.lineTo(end, canvas.height);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
    ctx.fillRect(start, 0, end - start, canvas.height);
}

export type ResizeEdge = 'start' | 'end';
const RESIZE_EDGE_WIDTH = 10; // in pixels

export const getResizeEdgeByOffset = (range: Range, offset: number): ResizeEdge | null => {
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
  }