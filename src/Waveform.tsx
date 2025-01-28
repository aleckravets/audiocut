import { useEffect, useRef } from 'react';
import style from './Waveform.module.scss';

interface WaveformProps {
  src: string;
}

const Waveform = ({ src }: WaveformProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAndDraw = async () => {
      if (src) {
        console.log('fetching...');
        const response = await fetch(src);

        console.log('decoding...');
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        console.log('drawing...');
        drawWaveform(ref.current!.querySelector("canvas")!, audioBuffer);
      }
    };

    fetchAndDraw();
  }, [src]);

  return (
    <div ref={ref} className={style.canvasContainer}>
      <canvas />
    </div>
  );
};

export default Waveform;

function drawWaveform(canvas: HTMLCanvasElement, audioBuffer: AudioBuffer) {
  const canvasContext = canvas.getContext('2d')!;

  const rawData = audioBuffer.getChannelData(0); // Get audio data from the first channel
  const sampleRate = Math.floor(rawData.length / canvas.width); // Calculate sampling rate
  const samples = [];
  for (let i = 0; i < rawData.length; i += sampleRate) {
    const slice = rawData.slice(i, i + sampleRate);
    const max = Math.max(...slice); // Get the maximum amplitude in the slice
    const min = Math.min(...slice); // Get the minimum amplitude in the slice
    samples.push({ max, min });
  }

  // Clear canvas
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  // Draw waveform
  const middle = canvas.height / 2;
  canvasContext.fillStyle = '#1DB954'; // Greenish color for waveform
  canvasContext.beginPath();

  // Draw top part of waveform
  for (let i = 0; i < samples.length; i++) {
    const x = i;
    const y = middle - samples[i].max * middle; // Scale amplitude to fit canvas height
    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
  }

  // Draw bottom part of waveform
  // for (let i = samples.length - 1; i >= 0; i--) {
  //   const x = i;
  //   const y = middle - samples[i].min * middle; // Scale amplitude to fit canvas height
  //   canvasContext.lineTo(x, y);
  // }

  canvasContext.closePath();
  canvasContext.fill();
}