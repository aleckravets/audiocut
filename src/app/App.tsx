import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';
import { useFfmpeg } from '../audioPlayer/useFfmpeg';
import { useAudio } from '../audioPlayer/useAudio';
import Waveform from '../waveform/Waveform';
import { Volume } from '../audioPlayer/Volume';
import style from './App.module.scss';
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, Download, Scissors } from "lucide-react";

const DEBUG = import.meta.env.DEV

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

  const handleFileSelect = (file: File) => {
    setIsEdited(false);
    setFile(file);
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <img src='./logo.svg' alt="AudioCut" />
        </div>
      </div>
      <div className={style.content}>
        <div className={style.filePicker}>
          <FilePicker onSelect={handleFileSelect} />
        </div>
        <div className={style.toolbar}>
          <div className={style.controls}>
            <Button onClick={togglePlay}>
              {status === 'playing' ? <><Pause /> Pause</> : <><Play /> Play</>}
            </Button>
            <Button onClick={stop}><Square /> Stop</Button>
            <label>
              <input
                type="checkbox"
                checked={loop}
                onChange={toggleLoop}
              />
              Loop
            </label>
            <Volume volume={volume} onChange={setVolume} />
            {currentTime !== null && <p>{formatTime(currentTime)}</p>}
          </div>
          <div className={style.tools}>
            <Button onClick={() => range && handleCut(range[0], range[1])} disabled={!range}>
              <Scissors /> Cut
            </Button>
            <Button onClick={handleDownload}>
              <Download /> Download
            </Button>
          </div>
        </div>
        <div className={style.trackContainer}>
          <Waveform
            fileUrl={fileUrl}
            duration={duration}
            currentTime={currentTime}
            onRangeChange={setRange}
            onSeek={seek}
          />
          {DEBUG &&
            <>
              <p>{range && formatTimeRange(range[0], range[1])}</p>
              <p>{currentTime} / {duration}</p>
            </>
          }
        </div>
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
