import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { DownloadProgressEvent } from "node_modules/@ffmpeg/util/dist/cjs/types";
import { useEffect, useState } from "react";

export const CORE_VERSION = "0.12.9";
export const CORE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm/ffmpeg-core.js`;
export const CORE_MT_URL = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/esm/ffmpeg-core.js`;

export enum Status {
  NOT_LOADED,
  LOADING,
  LOADED,
}

const IS_MT = typeof SharedArrayBuffer === "function";

export function useFfmpeg() {
  const [status, setStatus] = useState(Status.LOADING);
  const [ffmpeg, _] = useState(new FFmpeg());
  const [working, setWorking] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [received, setReceived] = useState(0);

  const load = async (mt: boolean) => {
    const setProgress = ({ url, received }: DownloadProgressEvent) => {
      setUrl(url as string);
      setReceived(received);
    };

    const coreURL = await toBlobURL(
      mt ? CORE_MT_URL : CORE_URL,
      "text/javascript",
      true,
      setProgress
    );
    const wasmURL = await toBlobURL(
      mt
        ? CORE_MT_URL.replace(/.js$/g, ".wasm")
        : CORE_URL.replace(/.js$/g, ".wasm"),
      "application/wasm",
      true,
      setProgress
    );
    const workerURL = mt
      ? await toBlobURL(
        CORE_MT_URL.replace(/.js$/g, ".worker.js"),
        "text/javascript",
        true,
        setProgress
      )
      : "";

    // ffmpeg.terminate();

    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    });

    setStatus(Status.LOADED);
  };

  useEffect(() => {
    load(IS_MT);
  }, []);

  const cut = async (fileUrl: string, start: number, end: number) => {
    setWorking(true);

    await ffmpeg.writeFile("input", await fetchFile(fileUrl));
    await ffmpeg.exec(["-i", "input", "-ss", `${start}`, "-to", `${end}`, "output.mp3"]);
    const fileData = await ffmpeg.readFile("output.mp3");
    const data = new Uint8Array(fileData as ArrayBuffer);

    setWorking(false);

    return new File([data.buffer], "output.mp3", { type: "audio/mp3" });
  };

  return { status, url, received, cut, working };
}