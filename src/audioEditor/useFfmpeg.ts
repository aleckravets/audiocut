import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { useEffect, useState } from "react";

export function useFfmpeg() {
  const [loading, setLoading] = useState<Promise<boolean> | null>(null);
  const [ffmpeg, _] = useState(new FFmpeg());
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm";
      ffmpeg.on("log", ({type, message}) => console.log(type, message));
      // ffmpeg.on("progress", ({time, progress}) => console.log('[progress]', type, message));

      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      const loaded = ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });

      setLoading(loaded);
    };

    load();
  }, []);

  const cut = async (fileUrl: string, start: number, end: number) => {
    setWorking(true);

    await loading;

    await ffmpeg.writeFile("input", await fetchFile(fileUrl));
    await ffmpeg.exec(["-i", "input", "-ss", `${start}`, "-to", `${end}`, "output.mp3"]);
    const fileData = await ffmpeg.readFile("output.mp3");
    const data = new Uint8Array(fileData as ArrayBuffer);

    setWorking(false);

    return new File([data.buffer], "output.mp3", { type: "audio/mp3" });
  };

  return { cut, working };
}