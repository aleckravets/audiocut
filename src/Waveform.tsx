import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';

export interface Range {
  start: number;
  end: number;
}

interface WaveformProps {
  fileUrl: string;
  onSelectionChange: (newSelection: Range | null) => void;
}

type ResizeHandle = 'start' | 'end';

const RESIZE_HANDLE_WIDTH = 10;
const MIN_RANGE_WIDTH = 0.01;

const hasMinRangeWidth = (range: Range) => range.end - range.start > MIN_RANGE_WIDTH;

const Waveform = ({ fileUrl, onSelectionChange }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rangeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const [range, setRange] = useState<Range | null>(null);
  const [draftRange, setDraftRange] = useState<Range | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null)

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

  const drawRange = () => {
    const canvas = rangeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentRange = draftRange || range;

    if (currentRange && hasMinRangeWidth(currentRange)) {
      const { start, end } = currentRange;

      const startPx = percentToPixel(start)
      const endPx = percentToPixel(end)

      ctx.beginPath()
      ctx.strokeStyle = '#ffa500'
      ctx.lineWidth = 2

      ctx.moveTo(startPx, 0)
      ctx.lineTo(startPx, canvas.height)
      ctx.moveTo(endPx, 0)
      ctx.lineTo(endPx, canvas.height)
      ctx.stroke()

      ctx.fillStyle = 'rgba(255, 165, 0, 0.2)'
      ctx.fillRect(startPx, 0, endPx - startPx, canvas.height)
    }
  }

  const findResizeHandle = (x: number): ResizeHandle | null => {
    if (range) {
      const startPx = percentToPixel(range.start)
      const endPx = percentToPixel(range.end)

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

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number, percent: number } | null => {
    let clientX: number;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) {
        return null;
      }
      clientX = e.touches[0].clientX;
    } else {
      // Mouse event
      clientX = e.clientX
    }

    const rect = canvasRef.current!.getBoundingClientRect();

    const x = clientX - rect.left;

    return {
      x,
      percent: pixelToPercent(x)
    }
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);

    if (!coords) {
      return;
    }

    // Check for resize handles first
    const handle = findResizeHandle(coords.x);

    if (handle) {
      setResizeHandle(handle);
      setDraftRange(range);
    }
    else {
      // If not resizing, start new range
      setResizeHandle('end');
      setDraftRange({ start: coords.percent, end: coords.percent });
      setRange(null);  // Clear existing range when starting new selection
    }
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!draftRange) {
      return;
    }

    const coords = getCoordinates(e);

    if (!coords) {
      return;
    }

    let start = resizeHandle === 'start' ? coords.percent : draftRange.start;
    let end = resizeHandle === 'end' ? coords.percent : draftRange.end;

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

    if (hasMinRangeWidth(draftRange)) {
      setRange(draftRange);
      onSelectionChange(draftRange);
    }
    else {
      setRange(null);
      onSelectionChange(null);
    }
  }

  const updateCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = rangeCanvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left;
    const handle = findResizeHandle(x)

    if (handle) {
      e.currentTarget.style.cursor = 'ew-resize'
    } else {
      e.currentTarget.style.cursor = 'pointer'
    }
  }

  // Convert pixel position to percentage
  const pixelToPercent = (pixel: number): number => {
    if (!canvasRef.current) return 0
    return (pixel / canvasRef.current.width) * 100
  }

  // Convert percentage to pixel position
  const percentToPixel = (percent: number): number => {
    if (!canvasRef.current) return 0
    return (percent * canvasRef.current.width) / 100
  }

  useEffect(() => {
    drawRange();
  }, [range, draftRange]);

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

  // console.log(draftRange);

  return (
    <div ref={containerRef} className={style.container}>
      <canvas ref={canvasRef} />
      <canvas
        ref={rangeCanvasRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={(e) => {
          handleMove(e);
          updateCursor(e);
        }}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
      />
    </div>
  );
};

export default Waveform;