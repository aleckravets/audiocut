import { useEffect, useRef, useState } from 'react';
import style from './Waveform.module.scss';
import { drawWaveform } from './drawWaveform';

interface WaveformProps {
  src: string;
}

const Waveform = ({ src }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  // prevent dragging cursor on canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
    }
  }, [])

  useEffect(() => {
    const fetchAndDecode = async () => {
      if (src) {
        console.log('fetching...');
        const response = await fetch(src);

        console.log('decoding...');
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(audioBuffer);
      }
    };

    fetchAndDecode();
  }, [src]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (audioBuffer && container && canvas) {
      const observer = new ResizeObserver(() => {
        // Adjust for high-DPI screens (e.g., Retina displays)
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth;// * dpr;
        canvas.height = container.clientHeight;// * dpr;

        // canvas.getContext('2d')!.scale(dpr, dpr);

        console.log('drawing...');

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