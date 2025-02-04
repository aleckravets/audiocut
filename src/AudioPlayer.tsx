import { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Waveform from './Waveform';
import style from './AudioPlayer.module.scss';
import { Range } from './Waveform';
import { useAudio } from './useAudio';

interface AudioPlayerProps {
  fileUrl: string;
}

// duration and positions are in seconds (float)
const AudioPlayer = ({ fileUrl }: AudioPlayerProps) => {
  const {currentTime, volume, playing, duration, setVolume, togglePlay, stop, seek} = useAudio(fileUrl);
  const [savedVolume, setSavedVolume] = useState(volume);
  const [loop, setLoop] = useState(true);
  const [range, setRange] = useState<Range | null>();

  const handleRangeChange = (range: Range | null) => {
    setRange(range);

    // todo if selection start changed, seek to it
  }

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
        <button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={stop}>Stop</button>
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
          max={duration}
          onRangeChange={handleRangeChange}
        />
        <p>
          {range && formatTimeRange(range.start, range.end)}
        </p>
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