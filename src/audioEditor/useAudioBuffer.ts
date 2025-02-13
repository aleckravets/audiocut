import { useState, useEffect } from "react";

export function useAudioBuffer(fileUrl: string | null) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  useEffect(() => {
    if (fileUrl) {
      const loadAudio = async () => {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(audioBuffer);
          // setRange(null);
          // setDraftRange(null);
        } catch (error) {
          console.error('Error loading audio:', error);
        }
      };

      loadAudio();
    }
  }, [fileUrl]);

  return audioBuffer;
}
