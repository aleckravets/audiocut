import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';

interface WaveformProps {
  fileUrl: string;
}

const Waveform = ({ fileUrl }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

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

    if (audioBuffer && container && canvas) {
      const observer = new ResizeObserver(() => {
        // Adjust for high-DPI screens (e.g., Retina displays)
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth;// * dpr;
        canvas.height = container.clientHeight;// * dpr;

        drawWaveform(canvas, audioBuffer)
      });

      observer.observe(containerRef.current!);

      return () => observer.disconnect();
    }
  }, [audioBuffer]);

  return (
    <div ref={containerRef} className={style.container}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Waveform;