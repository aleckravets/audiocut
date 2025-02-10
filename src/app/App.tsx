import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';
import { useFfmpeg } from '../audioPlayer/useFfmpeg';
import { useAudio } from '../audioPlayer/useAudio';
import Waveform from '../waveform/Waveform';
import style from './App.module.scss';
import { Volume } from '../audioPlayer/Volume';

function App() {
  const [file, setFile] = useState<File>();
  const [fileUrl, setFileUrl] = useState<string>('./al-di-meola.mp3');
  const { currentTime, volume, status, duration, setVolume, togglePlay, stop, seek, range, setRange, toggleLoop, loop } = useAudio(fileUrl);
  const ffmpeg = useFfmpeg();
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleCut = async (start: number, end: number) => {
    // todo make loaded a promise
    if (ffmpeg.loaded) {
      const file = await ffmpeg.cut(fileUrl, start, end);
      setFile(file);
      setRange(null);
      setIsEdited(true);
    }
  }

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file!.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div>
      <FilePicker onSelect={setFile} />
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
        <button onClick={() => handleCut(range!.start, range!.end)} disabled={!range}>Cut</button>
        {isEdited && <button onClick={handleDownload} className={style.downloadButton}>Download</button>}
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
  )
}

export default App;

function formatTimeRange(start: number, end: number) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
