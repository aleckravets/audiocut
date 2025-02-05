import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from '../utils/drawWaveform';

export interface Range {
  start: number;
  end: number;
}

interface WaveformProps {
  fileUrl: string;
  duration: number | null;
  onRangeChange?: (newRange: Range | null) => void;
}

type ResizeHandle = 'start' | 'end';

const RESIZE_HANDLE_WIDTH = 10; // in pixels
const MIN_RANGE_WIDTH = 1; // in pixels

// todo split into two components waveform and range
const Waveform = ({ fileUrl, duration, onRangeChange }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rangeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const [range, setRange] = useState<Range | null>(null);
  const [draftRange, setDraftRange] = useState<Range | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [ignoreMinWidth, setIgnoreMinWidth] = useState(false);

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
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const rangeCanvas = rangeCanvasRef.current;

    if (audioBuffer && container && canvas && rangeCanvas) {
      const observer = new ResizeObserver(() => {
        // Adjust for high-DPI screens (e.g., Retina displays)
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth;// * dpr;
        canvas.height = container.clientHeight;// * dpr;

        rangeCanvas.width = canvas.width;

        drawWaveform(canvas, audioBuffer);
      });

      observer.observe(containerRef.current!);

      return () => observer.disconnect();
    }
  }, [audioBuffer]);

  const drawRange = (canvas: HTMLCanvasElement, range: Range) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { start, end } = range;

    const startPx = ratioToOffset(start);
    const endPx = ratioToOffset(end);

    ctx.beginPath();
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 2;

    ctx.moveTo(startPx, 0);
    ctx.lineTo(startPx, canvas.height);
    ctx.moveTo(endPx, 0);
    ctx.lineTo(endPx, canvas.height);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
    ctx.fillRect(startPx, 0, endPx - startPx, canvas.height);
  }

  const findResizeHandle = (x: number): ResizeHandle | null => {
    if (range) {
      const startPx = ratioToOffset(range.start)
      const endPx = ratioToOffset(range.end)

      // Check if near start edge
      if (Math.abs(x - startPx) <= RESIZE_HANDLE_WIDTH) {
        return 'start';
      }
      // Check if near end edge
      if (Math.abs(x - endPx) <= RESIZE_HANDLE_WIDTH) {
        return 'end';
      }
    }

    return null;
  }

  const getOffset = (e: MouseEvent | TouchEvent): { x: number, seconds: number } => {
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

    const x = clientX < left ? 0 : (clientX > right ? right - left : clientX - left);
    const ratio = offsetToRatio(x);

    return {
      x,
      seconds: ratio
    };
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const offset = getOffset(e as any);

    setIgnoreMinWidth(false);
    // Check for resize handles first
    const handle = findResizeHandle(offset.x);

    if (handle) {
      setResizeHandle(handle);
      setDraftRange(range);
    }
    else {
      // If not resizing, start new range
      setResizeHandle('end');
      setDraftRange({ start: offset.seconds, end: offset.seconds });
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

    let start = resizeHandle === 'start' ? offset.seconds : draftRange.start;
    let end = resizeHandle === 'end' ? offset.seconds : draftRange.end;

    if (start > end) {
      [start, end] = [end, start];
      setResizeHandle(resizeHandle === 'start' ? 'end' : 'start')
    }

    setDraftRange({ start, end });
  }

  const handleEnd = () => {
    if (!draftRange) {
      return;
    }

    setResizeHandle(null);
    setDraftRange(null);

    if (hasMinWidth(draftRange)) {
      setRange(draftRange);
      onRangeChange?.(draftRange);
    }
    else {
      setRange(null);
      onRangeChange?.(null);
    }
  }

  const updateCursor = (e: MouseEvent) => {
    const canvas = rangeCanvasRef.current!;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const handle = findResizeHandle(x);

    if (draftRange) {
      if (range) {
        canvas.style.cursor = 'ew-resize';
      }
      else {
        canvas.style.cursor = 'text';
      }
    }
    else {
      canvas.style.cursor = handle ? 'ew-resize' : 'text';
    }
  }

  const offsetToRatio = (offset: number) => (offset / canvasRef.current!.width) * duration;
  const ratioToOffset = (ratio: number) => (ratio * canvasRef.current!.width) / duration;
  const hasMinWidth = (range: Range) => ratioToOffset(range.end - range.start) >= MIN_RANGE_WIDTH;

  useEffect(() => {
    const currentRange = draftRange || range;

    if (currentRange && (hasMinWidth(currentRange) || ignoreMinWidth)) {
      drawRange(rangeCanvasRef.current!, currentRange);
      setIgnoreMinWidth(true);
    }
  }, [range, draftRange, ignoreMinWidth]);

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
      <canvas
        ref={rangeCanvasRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
};

export default Waveform;