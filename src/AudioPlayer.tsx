import { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Waveform from './Waveform';
import style from './AudioPlayer.module.scss';

interface AudioPlayerProps {
  src: string;
}

// duration and positions are in seconds (float)
const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const [audio, setAudio] = useState<HTMLAudioElement>();
  // todo save to local storage
  const [currentVolume, setCurrentVolume] = useState(1);
  const [savedVolume, setSavedVolume] = useState(currentVolume);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(0);
  const [loop, setLoop] = useState(true);
  const [resetPending, setResetPending] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = currentVolume;
    setAudio(audio);

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    });

    audio.addEventListener('loadedmetadata', () => {
      setEndPosition(audio.duration);
      setDuration(audio.duration);
    });

    return () => {
      // audio won't be garbage-collected until paused
      audio.pause();
    }
  }, [src]);

  const seek = (value: number) => audio && (audio.currentTime = value);

  useEffect(() => {
    if (currentTime >= endPosition) {
      if (loop) {
        seek(startPosition);
      }
      else {
        stop();
      }
    }
  }, [currentTime]);

  useEffect(() => {
    if (audio) {
      audio.volume = currentVolume;
    }
  }, [currentVolume]);

  const togglePlay = () => {
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = startPosition;
      setPlaying(false);
    }
  };

  const toggleLoop = () => {
    setLoop(!loop);
  };

  const changeRange = (values: number[]) => {
    if (values[0] != startPosition) {
      setResetPending(true);
    }

    setStartPosition(values[0]);
    setEndPosition(values[1]);
  };

  const applyRange = () => {
    if (resetPending) {
      seek(startPosition);
      setResetPending(false);
    }

    if (audio && endPosition < audio.currentTime) {
      seek(endPosition);
    }
  }

  const handleVolumeChangeComplete = (value: number) => {
    if (value > 0) {
      setSavedVolume(value);
    }
  }

  const toggleMuted = () => {
    if (currentVolume === 0) {
      setCurrentVolume(savedVolume);
    }
    else {
      setCurrentVolume(0);
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
        {audio && <p>Current time: {formatTime(currentTime)}</p>}
        <button onClick={toggleMuted}>{currentVolume === 0 ? 'Unmute' : 'Mute'}</button>
        <label>
          Volume:
          <Slider
            min={0}
            max={1}
            value={currentVolume}
            step={0.01}
            onChange={value => setCurrentVolume(value as number)}
            onChangeComplete={value => handleVolumeChangeComplete(value as number)}
            className={style.volumeSlider}
          />
        </label>
      </div>
      {audio && !duration && <p>Loading audio...</p>}
      {duration &&
        <div className={style.trackContainer}>
          <Slider
            range
            min={0}
            max={duration}
            defaultValue={[startPosition, endPosition]}
            onChange={values => changeRange(values as number[])}
            onChangeComplete={applyRange}
            step={0.1}
            className={style.rangeSlider}
          />
          <Waveform src={src} />

          <p>
            {formatTimeRange(startPosition, endPosition)}
          </p>
        </div>
      }
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