import { useEffect, useState, useRef } from "react";

interface Options {
    loop?: boolean;
}

export function useAudio(fileUrl: string, options?: Options) {
    const {loop} = options || {};
    const [audio, setAudio] = useState<HTMLAudioElement | null>();
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (fileUrl) {
            const audio = new Audio(fileUrl);

            audio.addEventListener('ended', () => setCurrentTime(audio.duration));

            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });

            audio.addEventListener('volumechange', () => setVolume(audio.volume));

            audio.addEventListener('play', () => setPlaying(true));
            audio.addEventListener('pause', () => setPlaying(false));

            setAudio(audio);
            setPlaying(false);

            return () => {
                // audio should be paused to let it be garbage-collected
                audio.pause();
            }
        }

        setAudio(null);
        setCurrentTime(null);
        setDuration(null);
        setPlaying(false);
    }, [fileUrl]);

    useEffect(() => {
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

    useEffect(() => {
        if (audio && loop !== undefined) {
            audio.loop = loop;
        }
    }, [audio, loop]);

    const togglePlay = () => {
        if (audio) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
    };

    const play = () => {
        if (audio) {
            audio.play();
        }
    }

    const stop = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    const seek = (time: number) => {
        if (audio) {
            audio.currentTime = time;
        }
    };

    const setUserVolume = (volume: number) => {
        if (audio) {
            audio.volume = volume;
        }
    };

    return {
        audio,
        duration,
        currentTime,
        playing,
        volume,
        play,
        togglePlay,
        stop,
        seek,
        setVolume: setUserVolume
    };
}