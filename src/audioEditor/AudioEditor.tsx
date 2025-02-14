import { Play, Pause, Square, Download, Scissors, Repeat, Loader2 } from "lucide-react";
import { Status, useFfmpeg } from './useFfmpeg';
import { useAudio } from './useAudio';
import Waveform from '../waveform/Waveform';
import { Volume } from './Volume';
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import style from './AudioEditor.module.scss';
import { formatTime } from "@/utils/timeUtils";

interface AudioEditorProps {
  file: File;
}

const AudioEditor = ({ file }: AudioEditorProps) => {
  const [currentFile, setCurrentFile] = useState(file);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { audio, currentTime, volume, status, duration, setVolume, togglePlay, stop, seek, range, setRange, toggleLoop, loop } = useAudio(fileUrl);
  const [loading, setLoading] = useState(true);
  const ffmpeg = useFfmpeg();

  const isEdited = file !== currentFile;

  useEffect(() => {
    if (file) {
      setCurrentFile(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentFile]);


  const handleCut = async (start: number, end: number) => {
    const file = await ffmpeg.cut(fileUrl!, start, end);
    setCurrentFile(file);
  }

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = currentFile!.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const disabled = !audio || loading;

  const ffmpegBusy = ffmpeg.status === Status.LOADING || ffmpeg.working;

  return (
    <div>
      <div className={style.toolbar}>
        <div className={style.controls}>
          <Button onClick={togglePlay} disabled={disabled} title={status === 'playing' ? 'Pause' : 'Play'}>
            {status === 'playing' ? <Pause /> : <Play />}
          </Button>
          <Button onClick={stop} disabled={disabled} title='Stop'><Square /></Button>
          <Button onClick={toggleLoop} disabled={disabled} variant={loop ? 'default' : 'secondary'} title='Repeat'><Repeat /></Button>
          <Volume volume={volume} onChange={setVolume} disabled={disabled} />
        </div>
      </div>
      <Waveform
        fileUrl={fileUrl}
        onStateChanged={setLoading}
        duration={duration}
        currentTime={currentTime}
        onRangeChange={setRange}
        onSeek={seek}
      />
      <div className={style.footer}>
        {!loading &&
          <div className={style.currentTime}>
            {formatTime(currentTime ?? 0)} / {formatTime(duration ?? 0)}
          </div>
        }
        <div className={style.tools}>
          {/* <div className={style.currentTime}>{range && formatTimeRange(range[0], range[1])}</div> */}
          <Button onClick={() => range && handleCut(range[0], range[1])} disabled={disabled || ffmpegBusy || !range}>
            {ffmpeg.working ? <Loader2 className="animate-spin" /> : <Scissors />} Cut
          </Button>
          <Button onClick={handleDownload} disabled={disabled || ffmpeg.working || !isEdited}>
            <Download /> Download
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AudioEditor;