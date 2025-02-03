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

type ResizeHandle = {
  edge: 'start' | 'end'
}

const RESIZE_HANDLE_WIDTH = 10

const Waveform = ({ fileUrl, onSelectionChange }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const [isDrawing, setIsDrawing] = useState(false)
  const [range, setRange] = useState<Range | null>(null)
  const [currentRange, setCurrentRange] = useState<Range | null>(null)
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
    const selectionCanvas = selectionCanvasRef.current;

    if (audioBuffer && container && canvas && selectionCanvas) {
      const observer = new ResizeObserver(() => {
        // Adjust for high-DPI screens (e.g., Retina displays)
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth;// * dpr;
        canvas.height = container.clientHeight;// * dpr;

        selectionCanvas.width = canvas.width;

        drawWaveform(canvas, audioBuffer);
      });

      observer.observe(containerRef.current!);

      return () => observer.disconnect();
    }
  }, [audioBuffer]);

  const drawSelection = () => {
    const canvas = selectionCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw the single range if it exists
    if (range) {
      const startPx = percentToPixel(range.start)
      const endPx = percentToPixel(range.end)

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

    // Draw current range while selecting
    if (currentRange) {
      const startPx = percentToPixel(currentRange.start)
      const endPx = percentToPixel(currentRange.end)

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
    if (!range) return null

    const startPx = percentToPixel(range.start)
    const endPx = percentToPixel(range.end)

    // Check if near start edge
    if (Math.abs(x - startPx) <= RESIZE_HANDLE_WIDTH) {
      return { edge: 'start' }
    }
    // Check if near end edge
    if (Math.abs(x - endPx) <= RESIZE_HANDLE_WIDTH) {
      return { edge: 'end' }
    }
    return null
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent): { x: number, percent: number } | null => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null

    let clientX: number
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
    } else {
      // Mouse event
      clientX = e.clientX
    }

    const x = clientX - rect.left
    return {
      x,
      percent: pixelToPercent(x)
    }
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e)
    if (!coords) return

    // Check for resize handles first
    const handle = findResizeHandle(coords.x)
    if (handle) {
      setResizeHandle(handle)
      setIsDrawing(true)
      return
    }

    // If not resizing, start new range
    setIsDrawing(true)
    setCurrentRange({ start: coords.percent, end: coords.percent })
    setRange(null)  // Clear existing range when starting new selection
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const coords = getCoordinates(e)
    if (!coords) return

    if (resizeHandle && range) {
      // Handle resizing
      const { edge } = resizeHandle
      const newRange = {
        start: edge === 'start' ? coords.percent : range.start,
        end: edge === 'end' ? coords.percent : range.end
      }

      // Sort start and end if they crossed
      if (newRange.start > newRange.end) {
        const temp = newRange.start
        newRange.start = newRange.end
        newRange.end = temp
        setResizeHandle({
          edge: edge === 'start' ? 'end' : 'start'
        })
      }

      setRange(newRange)
      onSelectionChange(newRange)
    } else if (currentRange) {
      setCurrentRange(prev => {
        if (!prev) return null
        return { ...prev, end: coords.percent }
      })
    }
  }

  const handleEnd = () => {
    if (resizeHandle) {
      setResizeHandle(null)
      setIsDrawing(false)
      return
    }

    if (!currentRange) return

    setIsDrawing(false)
    const newRange = {
      start: Math.min(currentRange.start, currentRange.end),
      end: Math.max(currentRange.start, currentRange.end)
    }

    // Only set the range if it has some width
    if (newRange.end - newRange.start > 0.1) {
      setRange(newRange)
      onSelectionChange(newRange)
    }
    setCurrentRange(null)
  }

  const updateCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
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
    drawSelection()
  }, [range, currentRange])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

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
  }, [])

  return (
    <div ref={containerRef} className={style.container}>
      <canvas ref={canvasRef} />
      <canvas
        ref={selectionCanvasRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={(e) => {
          handleMove(e)
          updateCursor(e)
        }}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
        onMouseLeave={handleEnd}
      />
    </div>
  );
};

export default Waveform;