import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Waveform from '../waveform/Waveform';
import style from './AudioPlayer.module.scss';
import { useAudio } from '../hooks/useAudio';
import { Range } from "../waveform/Range";
import { useAudioTime } from '../hooks/useAudioTime';

interface AudioPlayerProps {
  fileUrl: string;
}

// duration and positions are in seconds (float)
const AudioPlayer = ({ fileUrl }: AudioPlayerProps) => {
  const [loop, setLoop] = useState(true);
  const [range, setRange] = useState<Range | null>(null);
  const { audio, volume, status, duration, setVolume, togglePlay, pause, seek } = useAudio(fileUrl, { loop });
  const currentTime = useAudioTime(audio);
  const [savedVolume, setSavedVolume] = useState(volume);

  const handleRangeChange = (newRange: Range | null) => {
    setRange(newRange);

    if (newRange) {
      if (newRange.start !== range?.start) {
        seek(newRange.start);
      }
    }
  }

  useEffect(() => {
    if (range !== null && currentTime !== null) {
      if (currentTime >= range.end) {
        if (loop) {
          seek(range.start);
        }
        else {
          pause();
        }
      }
      if (currentTime < range.start) {
        seek(range.start);
      }
    }
  }, [currentTime, range, loop]);

  const toggleLoop = () => {
    setLoop(!loop);
  };

  const handleVolumeChangeComplete = (value: number) => {
    if (value > 0) {
      setSavedVolume(value);
    }
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(savedVolume);
    }
    else {
      setVolume(0);
    }
  }

  return (
    <div>
      <div className={style.controls}>
        <button onClick={togglePlay}>{status === 'playing' ? 'Pause' : 'Play'}</button>
        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={toggleLoop}
          />
          Loop
        </label>
        {currentTime !== null && <p>Current time: {formatTime(currentTime)}</p>}
        <button onClick={toggleMute}>{volume === 0 ? 'Unmute' : 'Mute'}</button>
        <label>
          Volume:
          <Slider
            min={0}
            max={1}
            value={volume}
            step={0.01}
            onChange={value => setVolume(value as number)}
            onChangeComplete={value => handleVolumeChangeComplete(value as number)}
            className={style.volumeSlider}
          />
        </label>
      </div>
      <div className={style.trackContainer}>
        <Waveform
          fileUrl={fileUrl}
          duration={duration}
          currentTime={currentTime}
          onRangeChange={handleRangeChange}
          onSeek={seek}
        />
        <p>{range && formatTimeRange(range.start, range.end)}</p>
        <p>{currentTime} / {duration}</p>
      </div>
    </div>
  );
};

function formatTimeRange(start: number, end: number) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default AudioPlayer;