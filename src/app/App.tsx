import FilePicker from '../filePicker/FilePicker'
import { useEffect, useState } from 'react';
import style from './App.module.scss';
import AudioEditor from '../audioEditor/AudioEditor';
import { tg } from './tg';

function App() {
  const [file, setFile] = useState<File>();
  useEffect(() => {
    if (tg) {
      tg.expand();
      tg.ready();
    }
  }, []);

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