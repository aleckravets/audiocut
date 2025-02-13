import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';
import { drawRange } from './drawRange';
import { Range } from "../types/Range";
import useResizeObserver from '../utils/useResizeObserver';
import drawCurrentTime from './drawCurrentTime';
import { clearCanvas } from './clearCanvas';

interface WaveformProps {
  fileUrl: string | null;
  duration?: number | null;
  currentTime?: number | null;
  onRangeChange?: (newRange: [number, number] | null) => void;
  onSeek?: (time: number) => void;
  onStateChanged?: (loading: boolean) => void;
}

const MIN_RANGE_WIDTH = 1; // in pixels

type ResizeEdge = 'start' | 'end';
const RESIZE_EDGE_WIDTH = 10; // in pixels

// todo split into two components waveform and range
const Waveform = ({ fileUrl, duration, currentTime, onRangeChange, onSeek, onStateChanged }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rangeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTimeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [range, setRange] = useState<Range | null>(null);
  const [draftRange, setDraftRange] = useState<Range | null>(null);
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge | null>(null);
  const [ignoreMinWidth, setIgnoreMinWidth] = useState(false);
  const size = useResizeObserver(containerRef.current);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileUrl) {
      const loadAudio = async () => {
        try {
          clearCanvas(canvasRef.current!);
          setLoading(true);
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(audioBuffer);
        } catch (error) {
          console.error('Error loading audio:', error);
        }
      };

      loadAudio();
    }
  }, [fileUrl]);

  duration = duration || 1;

  const hasMinWidth = (range: Range) => (range.end - range.start) * canvasRef.current!.width >= MIN_RANGE_WIDTH;

  useEffect(() => {
    onStateChanged?.(loading);
  }, [loading]);

  useEffect(() => {
    if (audioBuffer) {
      const canvas = canvasRef.current!;
      canvas.width = size.width;
      drawWaveform(canvas, audioBuffer);
      setLoading(false);
    }
  }, [audioBuffer, size]);

  useEffect(() => {
    const rangeCanvas = rangeCanvasRef.current!;
    rangeCanvas.width = size.width;
    drawRange(rangeCanvas, range);
  }, [range, size]);

  useEffect(() => {
    if (size) {
      const currentTimeCanvas = currentTimeCanvasRef.current!;
      currentTimeCanvas.width = size.width;
      drawCurrentTime(currentTimeCanvas, typeof currentTime === 'number' ? currentTime / duration : null);
    }
  }, [currentTime, duration, size]);

  useEffect(() => {
    if (size && draftRange && (hasMinWidth(draftRange) || ignoreMinWidth)) {
      const canvas = rangeCanvasRef.current!;
      drawRange(canvas, draftRange);
      setIgnoreMinWidth(true);
    }
  }, [draftRange, ignoreMinWidth, size]);

  const getOffsetRatio = (e: MouseEvent | TouchEvent) => {
    let clientX: number;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) {
        throw new Error('Failed to get offset for touch event');
      }
      clientX = e.touches[0].clientX;
    } else {
      // Mouse event
      clientX = e.clientX;
    }

    const { left, right } = canvasRef.current!.getBoundingClientRect();

    return clientX < left ? 0 : (clientX > right ? 1 : (clientX - left) / (right - left));
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const offsetRatio = getOffsetRatio(e as any);

    setIgnoreMinWidth(false);

    // Check for resize handles first
    const resizeEdge = range && getResizeEdge(range, offsetRatio);

    if (resizeEdge) {
      setResizeEdge(resizeEdge);
      setDraftRange(range);
    }
    else {
      // If not resizing, start new range
      setResizeEdge('end');
      setDraftRange({ start: offsetRatio, end: offsetRatio });
      setRange(null);  // Clear existing range when starting new selection
    }

    // prevent selection when mouse goes outside of canvas while selecting a range
    if (!('touches' in e)) {
      e.preventDefault();
    }
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!draftRange) {
      return;
    }

    const offset = getOffsetRatio(e);

    let start = resizeEdge === 'start' ? offset : draftRange.start;
    let end = resizeEdge === 'end' ? offset : draftRange.end;

    if (start > end) {
      [start, end] = [end, start];
      setResizeEdge(resizeEdge === 'start' ? 'end' : 'start')
    }

    setDraftRange({ start, end });
  }

  const handleEnd = () => {
    if (!draftRange) {
      return;
    }

    setResizeEdge(null);
    setDraftRange(null);

    const { start, end } = draftRange;

    if (hasMinWidth(draftRange)) {
      setRange(draftRange);
      onRangeChange?.([start * duration, end * duration]);
    }
    else {
      setRange(null);
      onRangeChange?.(null);
      onSeek?.(start * duration);
    }
  }

  const getResizeEdge = (range: Range, offset: number): ResizeEdge | null => {
    if (range) {
      const width = canvasRef.current!.width;

      // Check if near start edge
      if (Math.abs(offset - range.start) * width <= RESIZE_EDGE_WIDTH) {
        return 'start';
      }
      // Check if near end edge
      if (Math.abs(offset - range.end) * width <= RESIZE_EDGE_WIDTH) {
        return 'end';
      }
    }

    return null;
  }

  const updateCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = rangeCanvasRef.current!;

    const { left, right } = canvas.getBoundingClientRect();

    const offsetRatio = (e.clientX - left) / (right - left);
    const resizeEdge = range && getResizeEdge(range, offsetRatio);

    if (draftRange) {
      if (range) {
        canvas.style.cursor = 'ew-resize';
      }
      else {
        canvas.style.cursor = 'text';
      }
    }
    else {
      canvas.style.cursor = resizeEdge ? 'ew-resize' : 'text';
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
    }
  }, [handleMove]);

  useEffect(() => {
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    }
  }, [handleEnd]);

  useEffect(() => {
    const container = containerRef.current!;

    const preventDefaultTouch = (e: TouchEvent) => {
      e.preventDefault()
    }

    // Prevent all touch events at container level
    container.addEventListener('touchstart', preventDefaultTouch, { passive: false })
    container.addEventListener('touchmove', preventDefaultTouch, { passive: false })
    container.addEventListener('touchend', preventDefaultTouch, { passive: false })

    return () => {
      container.removeEventListener('touchstart', preventDefaultTouch)
      container.removeEventListener('touchmove', preventDefaultTouch)
      container.removeEventListener('touchend', preventDefaultTouch)
    }
  }, []);

  return (
    <div ref={containerRef} className={style.container}>
      {loading && <div className={style.loading}>Loading...</div>}
      <canvas ref={canvasRef} />
      <canvas ref={currentTimeCanvasRef} />
      <canvas
        ref={rangeCanvasRef}
        onMouseMove={updateCursor}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
};

export default Waveform;