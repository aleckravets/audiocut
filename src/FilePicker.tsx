import { useDropzone } from 'react-dropzone';
import style from './FilePicker.module.css';

interface FilePickerProps {
  onChange: (file: File) => void;
}

const FilePicker = ({ onChange }: FilePickerProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onChange(acceptedFiles[0]);
    },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={isDragActive ? style.dragActive : ''}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop a file here, or click to select a file</p>
    </div>
  );
};

export default FilePicker;