import { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Waveform from './Waveform';
import style from './AudioPlayer.module.scss';
import { Range } from './Waveform';

interface AudioPlayerProps {
  fileUrl: string;
}

// duration and positions are in seconds (float)
const AudioPlayer = ({ fileUrl }: AudioPlayerProps) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>();
  const [volume, setVolume] = useState(1);
  const [savedVolume, setSavedVolume] = useState(volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [loop, setLoop] = useState(true);
  const [range, setRange] = useState<Range | null>();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (fileUrl) {
      const audio = new Audio(fileUrl);

      audio.volume = volume;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      });

      audio.addEventListener('loadedmetadata', () => {
      });

      audio.addEventListener('play', () => setPlaying(true));
      audio.addEventListener('pause', () => setPlaying(false));

      setAudio(audio);

      return () => {
        // audio won't be garbage-collected until paused
        audio.pause();
      }
    }

    setAudio(null);
  }, [fileUrl]);

  useEffect(() => {
    // todo ensure we're inside selection and looping
  }, [audio, range, loop])

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  useEffect(() => {
    if (audio) {

    }
  }, [audio, range])

  const handleRangeChange = (range: Range | null) => {
    setRange(range);

    // todo if selection start changed, seek to it
  }

  const togglePlay = () => {
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = range?.start || 0;
    }
  };

  const toggleLoop = () => {
    setLoop(!loop);
  };

  const handleVolumeChangeComplete = (value: number) => {
    if (value > 0) {
      setSavedVolume(value);
    }
  }

  const toggleMuted = () => {
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
        {audio && <p>Current time: {formatTime(currentTime)}</p>}
        <button onClick={toggleMuted}>{volume === 0 ? 'Unmute' : 'Mute'}</button>
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
          max={audio?.duration}
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