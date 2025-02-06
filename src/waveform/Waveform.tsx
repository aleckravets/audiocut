import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';
import { drawRange } from './drawRange';
import { Range } from "../types/Range";
import { ResizeEdge } from "./getResizeEdge";
import { getResizeEdge } from "./getResizeEdge";
import { clearCanvas } from './clearCanvas';

interface WaveformProps {
  fileUrl: string;
  duration?: number | null;
  currentTime?: number | null;
  onRangeChange?: (newRange: Range | null) => void;
  onSeek?: (time: number) => void;
}

const MIN_RANGE_WIDTH = 1; // in pixels

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

  duration = duration || 1;

  useEffect(() => {
    const loadAudio = async () => {
      if (!fileUrl) return;

      try {
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
  }, [fileUrl]);

  useEffect(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    const rangeCanvas = rangeCanvasRef.current!;
    const currentTimeCanvas = currentTimeCanvasRef.current!;

    if (audioBuffer) {
      const observer = new ResizeObserver(() => {
        // Adjust for high-DPI screens (e.g., Retina displays)
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth;// * dpr;
        canvas.height = container.clientHeight;// * dpr;

        rangeCanvas.width = canvas.width;
        currentTimeCanvas.width = canvas.width;

        drawWaveform(canvas, audioBuffer);
      });

      observer.observe(containerRef.current!);

      return () => observer.disconnect();
    }
  }, [audioBuffer]);

  useEffect(() => {
    const canvas = currentTimeCanvasRef.current!;

    const ctx = canvas.getContext('2d')!;

    clearCanvas(canvas);

    if (currentTime !== null && currentTime !== undefined) {
      // Calculate x position based on current time
      const x = timeToOffset(currentTime);

      // Draw the vertical line (current time)
      ctx.beginPath();
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 1;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }, [currentTime]);

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

    return clientX < left ? 0 : (clientX > right ? right - left : clientX - left);
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

  const updateCursor = (e: MouseEvent) => {
    const canvas = rangeCanvasRef.current!;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const resizeEdge = range && getResizeEdge(range, x);

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

  const offsetToTime = (offset: number) => (offset / canvasRef.current!.width) * duration;
  const timeToOffset = (time: number) => (time / duration) * canvasRef.current!.width;
  const hasMinWidth = (range: Range) => range.end - range.start >= MIN_RANGE_WIDTH;

  useEffect(() => {
    const canvas = rangeCanvasRef.current!;

    clearCanvas(canvas);

    const currentRange = draftRange || range;

    if (currentRange && (hasMinWidth(currentRange) || ignoreMinWidth)) {
      drawRange(canvas, currentRange);
      setIgnoreMinWidth(true);
    }
  }, [range, draftRange, ignoreMinWidth, clearCanvas, draftRange]);

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