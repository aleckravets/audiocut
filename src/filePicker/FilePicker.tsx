interface FilePickerProps {
  onSelect: (file: File) => void
}

const FilePicker = ({ onSelect: onFileSelect }: FilePickerProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onFileSelect(file)
  }

  return (
    <div className="file-picker">
      <input type="file" accept="audio/*" onChange={handleFileSelect} />
    </div>
  )
}

export default FilePicker 