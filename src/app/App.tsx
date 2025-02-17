import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';
import style from './App.module.scss';
import AudioEditor from '../audioEditor/AudioEditor';
import { Button } from '@/components/ui/button';

const SAMPLE_URL = "/sample.mp3";

function App() {
  const [file, setFile] = useState<File | null>();
  const [fileUrl, setFileUrl] = useState<string | null>();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleUseSample = () => {
    setFile(null);
    setFileUrl(SAMPLE_URL);
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <img src='./logo.svg' alt="AudioCut" />
        </div>
      </div>
      <div className={style.content}>
        <div className={style.filePickerContainer}>
          <div className={style.filePicker}>
            <FilePicker onFileSelect={setFile} />
          </div>
          <span>OR</span>
          <Button onClick={handleUseSample}>Use Sample</Button>
        </div>
        <div className="text-gray-500 text-center">{file ? file.name : fileUrl}</div>
        { fileUrl && <AudioEditor fileUrl={fileUrl} /> }
      </div>
    </div>
  )
}

export default App;