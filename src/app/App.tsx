import './App.css'
import AudioPlayer from '../audioPlayer/AudioPlayer'
import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';

function App() {
  const [file, setFile] = useState<File>();
  const [fileUrl, setFileUrl] = useState<string>('./al-di-meola.mp3');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div>
      <FilePicker onSelect={setFile} />
      <AudioPlayer fileUrl={fileUrl} />
    </div>
  )
}

export default App
