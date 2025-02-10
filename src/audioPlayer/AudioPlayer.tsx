import 'rc-slider/assets/index.css';
import Waveform from '../waveform/Waveform';
import style from './AudioPlayer.module.scss';
import { useAudio } from './useAudio';
import { Volume } from './Volume';

interface AudioPlayerProps {
  fileUrl: string;
  onCut?: (start: number, end: number) => void;
}

// duration and positions are in seconds (float)
const AudioPlayer = ({ fileUrl, onCut }: AudioPlayerProps) => {
  const { currentTime, volume, status, duration, setVolume, togglePlay, stop, seek, range, setRange, toggleLoop, loop } = useAudio(fileUrl);

  return (
    <div>
      <div className={style.controls}>
        <button onClick={togglePlay}>{status === 'playing' ? 'Pause' : 'Play'}</button>
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
        <Volume volume={volume} onChange={setVolume} />
        <button onClick={() => range && onCut?.(range.start, range.end)} disabled={!onCut || !range}>Cut</button>
      </div>
      <div className={style.trackContainer}>
        <Waveform
          fileUrl={fileUrl}
          duration={duration}
          currentTime={status === 'stopped' ? null : currentTime}
          onRangeChange={setRange}
          onSeek={time => status === 'stopped' ? seek(0) : seek(time)}
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