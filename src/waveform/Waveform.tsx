import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';
import { drawRange } from './drawRange';
import { Range } from "../types/Range";
import useResizeObserver from '../useResizeObserver';
import drawCurrentTime from './drawCurrentTime';

interface WaveformProps {
  fileUrl: string;
  duration?: number | null;
  currentTime?: number | null;
  onRangeChange?: (newRange: Range | null) => void;
  onSeek?: (time: number) => void;
}

const MIN_RANGE_WIDTH = 1; // in pixels

type ResizeEdge = 'start' | 'end';
const RESIZE_EDGE_WIDTH = 10; // in pixels

// todo split into two components waveform and range
const Waveform = ({ fileUrl, duration, currentTime, onRangeChange, onSeek }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rangeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTimeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const [range, setRange] = useState<Range | null>(null);
  const [draftRange, setDraftRange] = useState<Range | null>(null);
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge | null>(null);
  const [ignoreMinWidth, setIgnoreMinWidth] = useState(false);
  const { size } = useResizeObserver(containerRef.current);

  duration = duration || 1;

  const offsetToTime = (offset: number) => offset * duration;
  const timeToOffset = (time: number) => time / duration;
  const hasMinWidth = (range: Range) => (range.end - range.start) * canvasRef.current!.width >= MIN_RANGE_WIDTH;

  useEffect(() => {
    const loadAudio = async () => {
      if (!fileUrl) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(audioBuffer);
        setRange(null);
        setDraftRange(null);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();
  }, [fileUrl]);

  useEffect(() => {
    if (audioBuffer) {
      const container = containerRef.current!;
      const canvas = canvasRef.current!;
      canvas.width = container.clientWidth;
      drawWaveform(canvas, audioBuffer);
    }
  }, [audioBuffer, size]);

  useEffect(() => {
      const rangeCanvas = rangeCanvasRef.current!;
      rangeCanvas.width = size.width;
      drawRange(rangeCanvas, range);
  }, [range, size]);

  useEffect(() => {
    if (currentTime !== null && currentTime !== undefined && size) {
      const currentTimeCanvas = currentTimeCanvasRef.current!;
      const x = timeToOffset(currentTime);
      currentTimeCanvas.width = size.width;
      drawCurrentTime(currentTimeCanvas, x);
    }
  }, [currentTime, size, timeToOffset]);

  useEffect(() => {
    if (draftRange && (hasMinWidth(draftRange) || ignoreMinWidth)) {
      const canvas = rangeCanvasRef.current!;
      drawRange(canvas, draftRange);
      setIgnoreMinWidth(true);
    }
  }, [draftRange, ignoreMinWidth]);

  const getOffset = (e: MouseEvent | TouchEvent) => {
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

    return clientX < left ? 0 : (clientX > right ? right - left : clientX - left) / (right - left);
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const offset = getOffset(e as any);

    setIgnoreMinWidth(false);

    // Check for resize handles first
    const resizeEdge = range && getResizeEdge(range, offset);

    if (resizeEdge) {
      setResizeEdge(resizeEdge);
      setDraftRange(range);
    }
    else {
      // If not resizing, start new range
      setResizeEdge('end');
      setDraftRange({ start: offset, end: offset });
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

    const offset = getOffset(e);

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

    if (hasMinWidth(draftRange)) {
      setRange(draftRange);
      const rangeInSeconds = { start: offsetToTime(draftRange.start), end: offsetToTime(draftRange.end) };
      onRangeChange?.(rangeInSeconds);
    }
    else {
      setRange(null);
      onRangeChange?.(null);
      onSeek?.(offsetToTime(draftRange.start));
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

  const updateCursor = (e: MouseEvent) => {
    const canvas = rangeCanvasRef.current!;

    const rect = canvas.getBoundingClientRect();

    const offset = (e.clientX - rect.left) / (rect.right - rect.left);
    const resizeEdge = range && getResizeEdge(range, offset);

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
    document.addEventListener('mousemove', updateCursor);

    document.addEventListener('touchmove', handleMove);

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousemove', updateCursor);

      document.removeEventListener('touchmove', handleMove);

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
      <canvas ref={canvasRef} />
      <canvas ref={currentTimeCanvasRef} />
      <canvas
        ref={rangeCanvasRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
};

export default Waveform;