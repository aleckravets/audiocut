import FilePicker from '../filePicker/FilePicker'
import { useState } from 'react';
import style from './App.module.scss';
import AudioEditor from '../audioEditor/AudioEditor';

function App() {
  const [file, setFile] = useState<File>();

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <img src='./logo.svg' alt="AudioCut" />
        </div>
      </div>
      <div className={style.content}>
        <div className={style.filePicker}>
          <FilePicker onFileSelect={setFile} />
        </div>
        {file && <AudioEditor file={file} />}
      </div>
    </div>
  )
}

export default App;