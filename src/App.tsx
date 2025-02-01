import './App.css'
import AudioPlayer from './AudioPlayer'
import FilePicker from './FilePicker'
import { useEffect, useState } from 'react';

function App() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState<string>('./al-di-meola.mp3');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div>
      <FilePicker onChange={file => setFile(file)} />
      {url &&
        <>
          <AudioPlayer src={url} />
        </>
      }
    </div>
  )
}

export default App
