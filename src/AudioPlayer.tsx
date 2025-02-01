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
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(0);
  const [loop, setLoop] = useState(true);
  const [resetPending, setResetPending] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
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

  const changeVolume = (value: number) => {
    setVolume(value);

    if (audio) {
      audio.volume = value;
    }
  };

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
        <label>
          Volume:
          <Slider
            min={0}
            max={1}
            defaultValue={1}
            step={0.01}
            onChange={value => changeVolume(value as number)}
          />
        </label>
      </div>
      {audio && !duration && <p>Loading audio...</p>}
      {duration &&
        <>
          <Waveform src={src} />
          <div>
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
            <p>
              {formatTimeRange(startPosition, endPosition)}
            </p>
          </div>
        </>
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