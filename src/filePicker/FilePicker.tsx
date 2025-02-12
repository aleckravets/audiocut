import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FilePickerButtonProps {
  onFileSelect?: (file: File) => void;
}

const FilePickerButton: React.FC<FilePickerButtonProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Allow reselecting the same file
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect?.(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button onClick={handleClick} className="w-full flex items-center gap-2">
        <Upload size={18} /> Select File
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />
      <span className="text-sm text-gray-500">{fileName}</span>
    </div>
  );
};

export default FilePickerButton;
