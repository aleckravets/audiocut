import './App.css'
import AudioPlayer from '../audioPlayer/AudioPlayer'
import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';
import { useFfmpeg } from '../audioPlayer/useFfmpeg';

function App() {
  const [file, setFile] = useState<Blob>();
  const [fileUrl, setFileUrl] = useState<string>('./al-di-meola.mp3');
  const ffmpeg = useFfmpeg();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);


  const handleCut = async (start: number, end: number) => {
    if (ffmpeg.loaded) {
      const buffer = await ffmpeg.cut(fileUrl, start, end);
      setFile(new Blob([buffer], { type: "audio/mp3" }));
    }
  }

  return (
    <div>
      <FilePicker onSelect={setFile} />
      <AudioPlayer fileUrl={fileUrl} onCut={ffmpeg.loaded ? handleCut : undefined} />
    </div>
  )
}

export default App
