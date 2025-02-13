import { t as twMerge, c as clsx, j as jsxRuntimeExports, a as cva, S as Slot, r as reactExports, U as Upload, F as FFmpeg, b as toBlobURL, f as fetchFile, R as Root, T as Track, d as Range, e as Thumb, V as VolumeOff, g as Volume2, P as Pause, h as Play, i as Square, k as Repeat, L as LoaderCircle, l as Scissors, D as Download, m as clientExports } from "./vendor-DmRUXpq5.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:cursor-pointer",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const FilePickerButton = ({ onFileSelect }) => {
  const fileInputRef = reactExports.useRef(null);
  const [fileName, setFileName] = reactExports.useState("No file chosen");
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) {
      setFileName(file.name);
      onFileSelect == null ? void 0 : onFileSelect(file);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleClick, className: "w-30 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18 }),
      " Select File"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "file",
        ref: fileInputRef,
        onChange: handleFileChange,
        accept: "audio/*",
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: fileName })
  ] });
};
const container$1 = "_container_1yhdh_1";
const header = "_header_1yhdh_6";
const content = "_content_1yhdh_13";
const filePicker = "_filePicker_1yhdh_17";
const toolbar$1 = "_toolbar_1yhdh_23";
const controls$1 = "_controls_1yhdh_33";
const currentTime$1 = "_currentTime_1yhdh_39";
const footer$1 = "_footer_1yhdh_44";
const tools$1 = "_tools_1yhdh_49";
const trackContainer = "_trackContainer_1yhdh_56";
const debug$1 = "_debug_1yhdh_60";
const style$3 = {
  container: container$1,
  header,
  content,
  filePicker,
  toolbar: toolbar$1,
  controls: controls$1,
  currentTime: currentTime$1,
  footer: footer$1,
  tools: tools$1,
  trackContainer,
  debug: debug$1
};
function useFfmpeg() {
  const [loading2, setLoading] = reactExports.useState(null);
  const [ffmpeg, _] = reactExports.useState(new FFmpeg());
  const [working, setWorking] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm";
      ffmpeg.on("log", console.log);
      const loaded = ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        )
      });
      setLoading(loaded);
    };
    load();
  }, []);
  const cut = async (fileUrl, start, end) => {
    setWorking(true);
    await loading2;
    await ffmpeg.writeFile("input", await fetchFile(fileUrl));
    await ffmpeg.exec(["-i", "input", "-ss", `${start}`, "-to", `${end}`, "output.mp3"]);
    const fileData = await ffmpeg.readFile("output.mp3");
    const data = new Uint8Array(fileData);
    setWorking(false);
    return new File([data.buffer], "output.mp3", { type: "audio/mp3" });
  };
  return { cut, working };
}
const useAudioCurrentTime = (audio) => {
  const [currentTime2, setCurrentTime] = reactExports.useState(null);
  const animationFrameId = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const updateCurrentTime = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
      animationFrameId.current = requestAnimationFrame(updateCurrentTime);
    };
    animationFrameId.current = requestAnimationFrame(updateCurrentTime);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audio]);
  const setter = (time) => {
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };
  return [currentTime2, setter];
};
function useAudio(fileUrl) {
  const [audio, setAudio] = reactExports.useState(null);
  const [loop, setLoop] = reactExports.useState(false);
  const [duration, setDuration] = reactExports.useState(null);
  const [status, setStatus] = reactExports.useState(null);
  const [volume, setVolume] = reactExports.useState(1);
  const [range, setRange] = reactExports.useState(null);
  const [currentTime2, setCurrentTime] = useAudioCurrentTime(audio);
  reactExports.useEffect(() => {
    if (fileUrl) {
      const audio2 = new Audio(fileUrl);
      audio2.addEventListener("loadedmetadata", () => {
        setDuration(audio2.duration);
      });
      audio2.addEventListener("volumechange", () => setVolume(audio2.volume));
      setAudio(audio2);
      setStatus("stopped");
      setRange(null);
      return () => {
        audio2.pause();
        setAudio(null);
        setStatus(null);
        setDuration(null);
      };
    }
  }, [fileUrl]);
  const togglePlay = () => {
    if (audio) {
      if (status === "paused" || status === "stopped") {
        setStatus("playing");
        audio.play();
      } else {
        setStatus("paused");
        audio.pause();
      }
    }
  };
  const toggleLoop = () => {
    setLoop(!loop);
  };
  const setUserVolume = (volume2) => {
    if (audio) {
      audio.volume = volume2;
    }
  };
  const stop = () => {
    if (audio) {
      setStatus("stopped");
      audio.pause();
      setCurrentTime(range ? range[0] : 0);
    }
  };
  const handleSetRange = (newRange) => {
    setRange(newRange);
    if (newRange) {
      if (newRange[0] !== (range == null ? void 0 : range[0])) {
        setCurrentTime(newRange[0]);
      }
    }
  };
  reactExports.useEffect(() => {
    if (audio && range && typeof currentTime2 === "number" && currentTime2 >= range[1]) {
      audio.currentTime = range[0];
      if (!loop) {
        setStatus("stopped");
        audio.pause();
      }
    }
  }, [audio, range, currentTime2, loop]);
  reactExports.useEffect(() => {
    if (audio) {
      const handleEnd = () => {
        audio.currentTime = range ? range[0] : 0;
        if (loop) {
          audio.play();
        } else {
          setStatus("stopped");
          audio.pause();
        }
      };
      audio.addEventListener("ended", handleEnd);
      return () => audio.removeEventListener("ended", handleEnd);
    }
  }, [audio, range, loop]);
  return {
    audio,
    duration,
    currentTime: currentTime2,
    status,
    volume,
    stop,
    range,
    loop,
    togglePlay,
    seek: setCurrentTime,
    toggleLoop,
    setVolume: setUserVolume,
    setRange: handleSetRange
  };
}
const container = "_container_tvcxf_1";
const loading = "_loading_tvcxf_16";
const flicker = "_flicker_tvcxf_1";
const style$2 = {
  container,
  loading,
  flicker
};
const lineOffset = 0.5;
function drawWaveform(canvas, audioBuffer) {
  const rawData = audioBuffer.getChannelData(0);
  const barWidth = 2;
  const gap = 1;
  const step = Math.ceil(rawData.length / (canvas.width / (barWidth + gap)));
  const normalizedData = [];
  for (let i = 0; i < rawData.length; i += step) {
    const slice = rawData.slice(i, i + step);
    const sum = slice.reduce((acc, val) => acc + Math.abs(val), 0);
    normalizedData.push(sum / slice.length);
  }
  const maxHeight = Math.max(...normalizedData);
  const scaledData = normalizedData.map((n) => n / maxHeight * canvas.height);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = canvasLinearGradient(context, waveGradient);
  for (let i = 0; i < scaledData.length; i++) {
    const barHeight = scaledData[i];
    const x = i * (barWidth + gap);
    const y = (canvas.height - barHeight) * lineOffset;
    context.fillRect(x, y, barWidth, barHeight);
  }
  context.clearRect(0, canvas.height * lineOffset, canvas.width, 1);
}
function canvasLinearGradient(canvasCtx, colorStops) {
  var l = canvasCtx.canvas.height;
  var u = colorStops.map(function(stop) {
    var opacity = stop.length === 3 ? stop[2] : 1;
    return [stop[0], stop[1], opacity];
  });
  return u.reduce(function(e, stop) {
    var sValue = stop[0], color = stop[1], opacity = stop[2], clr = "rgba(" + color + "," + opacity + ")";
    return e.addColorStop(sValue, clr), e;
  }, canvasCtx.createLinearGradient(0, 0, 0, l));
}
const waveGradient = [[0, "255,255,255"], [lineOffset, "255,255,255"], [lineOffset, "229,229,229"], [1, "229,229,229"]];
const drawRange = (canvas, range) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!range) return;
  const { start, end } = range;
  ctx.fillStyle = "rgba(255, 165, 0, 0.2)";
  ctx.fillRect(start * canvas.width, 0, (end - start) * canvas.width, canvas.height);
};
function useResizeObserver(element) {
  const [size, setSize] = reactExports.useState({ width: 0, height: 0 });
  reactExports.useEffect(() => {
    if (element) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [element]);
  return size;
}
const drawCurrentTime = (canvas, offsetRatio) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof offsetRatio !== "number") return;
  const offset = offsetRatio * canvas.width;
  ctx.beginPath();
  ctx.strokeStyle = "#ffa500";
  ctx.lineWidth = 1;
  ctx.moveTo(offset, 0);
  ctx.lineTo(offset, canvas.height);
  ctx.stroke();
};
const clearCanvas = (canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
const MIN_RANGE_WIDTH = 1;
const RESIZE_EDGE_WIDTH = 10;
const Waveform = ({ fileUrl, duration, currentTime: currentTime2, onRangeChange, onSeek, onStateChanged }) => {
  const containerRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const rangeCanvasRef = reactExports.useRef(null);
  const currentTimeCanvasRef = reactExports.useRef(null);
  const [range, setRange] = reactExports.useState(null);
  const [draftRange, setDraftRange] = reactExports.useState(null);
  const [resizeEdge, setResizeEdge] = reactExports.useState(null);
  const [ignoreMinWidth, setIgnoreMinWidth] = reactExports.useState(false);
  const size = useResizeObserver(containerRef.current);
  const [audioBuffer, setAudioBuffer] = reactExports.useState();
  const [loading2, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (fileUrl) {
      const loadAudio = async () => {
        try {
          clearCanvas(canvasRef.current);
          setLoading(true);
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer2 = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(audioBuffer2);
        } catch (error) {
          console.error("Error loading audio:", error);
        }
      };
      loadAudio();
    }
  }, [fileUrl]);
  duration = duration || 1;
  const hasMinWidth = (range2) => (range2.end - range2.start) * canvasRef.current.width >= MIN_RANGE_WIDTH;
  reactExports.useEffect(() => {
    onStateChanged == null ? void 0 : onStateChanged(loading2);
  }, [loading2]);
  reactExports.useEffect(() => {
    if (audioBuffer) {
      const canvas = canvasRef.current;
      canvas.width = size.width;
      drawWaveform(canvas, audioBuffer);
      setLoading(false);
      setRange(null);
    }
  }, [audioBuffer, size]);
  reactExports.useEffect(() => {
    const rangeCanvas = rangeCanvasRef.current;
    rangeCanvas.width = size.width;
    drawRange(rangeCanvas, range);
  }, [range, size]);
  reactExports.useEffect(() => {
    if (size) {
      const currentTimeCanvas = currentTimeCanvasRef.current;
      currentTimeCanvas.width = size.width;
      drawCurrentTime(currentTimeCanvas, typeof currentTime2 === "number" ? currentTime2 / duration : null);
    }
  }, [currentTime2, duration, size]);
  reactExports.useEffect(() => {
    if (size && draftRange && (hasMinWidth(draftRange) || ignoreMinWidth)) {
      const canvas = rangeCanvasRef.current;
      drawRange(canvas, draftRange);
      setIgnoreMinWidth(true);
    }
  }, [draftRange, ignoreMinWidth, size]);
  const getOffsetRatio = (e) => {
    let clientX;
    if ("touches" in e) {
      if (e.touches.length === 0) {
        throw new Error("Failed to get offset for touch event");
      }
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const { left, right } = canvasRef.current.getBoundingClientRect();
    return clientX < left ? 0 : clientX > right ? 1 : (clientX - left) / (right - left);
  };
  const handleStart = (e) => {
    if (loading2) return;
    const offsetRatio = getOffsetRatio(e);
    setIgnoreMinWidth(false);
    const resizeEdge2 = range && getResizeEdge(range, offsetRatio);
    if (resizeEdge2) {
      setResizeEdge(resizeEdge2);
      setDraftRange(range);
    } else {
      setResizeEdge("end");
      setDraftRange({ start: offsetRatio, end: offsetRatio });
      setRange(null);
    }
    if (!("touches" in e)) {
      e.preventDefault();
    }
  };
  const handleMove = (e) => {
    if (!draftRange) {
      return;
    }
    const offset = getOffsetRatio(e);
    let start = resizeEdge === "start" ? offset : draftRange.start;
    let end = resizeEdge === "end" ? offset : draftRange.end;
    if (start > end) {
      [start, end] = [end, start];
      setResizeEdge(resizeEdge === "start" ? "end" : "start");
    }
    setDraftRange({ start, end });
  };
  const handleEnd = () => {
    if (!draftRange) {
      return;
    }
    setResizeEdge(null);
    setDraftRange(null);
    const { start, end } = draftRange;
    if (hasMinWidth(draftRange)) {
      setRange(draftRange);
      onRangeChange == null ? void 0 : onRangeChange([start * duration, end * duration]);
    } else {
      setRange(null);
      onRangeChange == null ? void 0 : onRangeChange(null);
      onSeek == null ? void 0 : onSeek(start * duration);
    }
  };
  const getResizeEdge = (range2, offset) => {
    if (range2) {
      const width = canvasRef.current.width;
      if (Math.abs(offset - range2.start) * width <= RESIZE_EDGE_WIDTH) {
        return "start";
      }
      if (Math.abs(offset - range2.end) * width <= RESIZE_EDGE_WIDTH) {
        return "end";
      }
    }
    return null;
  };
  const updateCursor = (e) => {
    const canvas = rangeCanvasRef.current;
    const { left, right } = canvas.getBoundingClientRect();
    const offsetRatio = (e.clientX - left) / (right - left);
    const resizeEdge2 = range && getResizeEdge(range, offsetRatio);
    if (draftRange) {
      if (range) {
        canvas.style.cursor = "ew-resize";
      } else {
        canvas.style.cursor = "text";
      }
    } else {
      canvas.style.cursor = resizeEdge2 ? "ew-resize" : "text";
    }
  };
  reactExports.useEffect(() => {
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
    };
  }, [handleMove]);
  reactExports.useEffect(() => {
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [handleEnd]);
  reactExports.useEffect(() => {
    const container2 = containerRef.current;
    const preventDefaultTouch = (e) => {
      e.preventDefault();
    };
    container2.addEventListener("touchstart", preventDefaultTouch, { passive: false });
    container2.addEventListener("touchmove", preventDefaultTouch, { passive: false });
    container2.addEventListener("touchend", preventDefaultTouch, { passive: false });
    return () => {
      container2.removeEventListener("touchstart", preventDefaultTouch);
      container2.removeEventListener("touchmove", preventDefaultTouch);
      container2.removeEventListener("touchend", preventDefaultTouch);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: style$2.container, children: [
    loading2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style$2.loading, children: "Loading..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: currentTimeCanvasRef }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: rangeCanvasRef,
        onMouseMove: updateCursor,
        onMouseDown: handleStart,
        onTouchStart: handleStart
      }
    )
  ] });
};
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center hover:cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-default",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Root.displayName;
const volumeSlider = "_volumeSlider_zqtph_1";
const style$1 = {
  volumeSlider
};
function Volume({ volume, onChange, disabled }) {
  const [lastValue, setLastValue] = reactExports.useState(volume || 1);
  const handleVolumeChangeComplete = (value) => {
    if (value > 0) {
      setLastValue(value);
    }
  };
  const toggleMute = () => {
    if (volume === 0) {
      onChange == null ? void 0 : onChange(lastValue);
    } else {
      onChange == null ? void 0 : onChange(0);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: toggleMute,
        title: volume === 0 ? "Unmute" : "Mute",
        disabled,
        children: volume === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Slider,
      {
        value: [volume ?? 1],
        max: 1,
        step: 0.01,
        onValueChange: (value) => onChange == null ? void 0 : onChange(value[0]),
        onValueCommit: (value) => handleVolumeChangeComplete(value[0]),
        className: style$1.volumeSlider,
        title: "Volume",
        disabled
      }
    )
  ] });
}
const toolbar = "_toolbar_1sxva_1";
const controls = "_controls_1sxva_8";
const currentTime = "_currentTime_1sxva_14";
const footer = "_footer_1sxva_19";
const tools = "_tools_1sxva_24";
const debug = "_debug_1sxva_31";
const style = {
  toolbar,
  controls,
  currentTime,
  footer,
  tools,
  debug
};
function formatTimeRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
const AudioEditor = ({ file }) => {
  const [currentFile, setCurrentFile] = reactExports.useState(file);
  const [fileUrl, setFileUrl] = reactExports.useState(null);
  const { audio, currentTime: currentTime2, volume, status, duration, setVolume, togglePlay, stop, seek, range, setRange, toggleLoop, loop } = useAudio(fileUrl);
  const [loading2, setLoading] = reactExports.useState(true);
  const ffmpeg = useFfmpeg();
  const isEdited = file !== currentFile;
  reactExports.useEffect(() => {
    if (file) {
      setCurrentFile(file);
    }
  }, [file]);
  reactExports.useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentFile]);
  const handleCut = async (start, end) => {
    try {
      const file2 = await ffmpeg.cut(fileUrl, start, end);
      setCurrentFile(file2);
    } catch (error) {
      console.log("Failed to cut audio: ", error);
    }
  };
  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = currentFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const disabled = !audio || loading2;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style.toolbar, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style.controls, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: togglePlay, disabled, title: status === "playing" ? "Pause" : "Play", children: status === "playing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: stop, disabled, title: "Stop", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: toggleLoop, disabled, variant: loop ? "default" : "secondary", title: "Repeat", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Volume, { volume, onChange: setVolume, disabled })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Waveform,
      {
        fileUrl,
        onStateChanged: setLoading,
        duration,
        currentTime: currentTime2,
        onRangeChange: setRange,
        onSeek: seek
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style.footer, children: [
      !loading2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style.currentTime, children: [
        formatTime(currentTime2 ?? 0),
        " / ",
        formatTime(duration ?? 0)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style.tools, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style.currentTime, children: range && formatTimeRange(range[0], range[1]) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => range && handleCut(range[0], range[1]), disabled: disabled || ffmpeg.working || !range, children: [
          ffmpeg.working ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, {}),
          " Cut"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleDownload, disabled: disabled || ffmpeg.working || !isEdited, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
          " Download"
        ] })
      ] })
    ] })
  ] });
};
function App() {
  const [file, setFile] = reactExports.useState();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style$3.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style$3.header, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "./logo.svg", alt: "AudioCut" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: style$3.content, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style$3.filePicker, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePickerButton, { onFileSelect: setFile }) }),
      file && /* @__PURE__ */ jsxRuntimeExports.jsx(AudioEditor, { file })
    ] })
  ] });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
