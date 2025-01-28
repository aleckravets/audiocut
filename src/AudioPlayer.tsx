import { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(0);

  useEffect(() => {
    if (src) {
      const audio = new Audio(src);
      setAudio(audio);
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('loadedmetadata', () => {
        setEndPosition(audio.duration);
        setDuration(audio.duration)
      });
    }
  }, [src]);

  const handleTogglePlay = () => {
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.currentTime = startPosition;
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setStartPosition(value[0]);
    setEndPosition(value[1]);
  };

  return (
    <div>
      <button onClick={handleTogglePlay}>{playing ? 'Pause' : 'Play'}</button>
      <button onClick={handleStop}>Stop</button>
      <div>
        <Slider
          range
          min={0}
          max={duration}
          value={[startPosition, endPosition]}
          onChange={handleSliderChange as any}
          step={0.01}
        />
        <p>
          {startPosition.toFixed(2)} - {endPosition.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;


