import { useEffect, useState } from "react";

interface Options {
    loop?: boolean;
}

type AudioStatus = 'playing' | 'paused';

export function useAudio(fileUrl: string, options?: Options) {
    const { loop } = options || {};
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [status, setStatus] = useState<AudioStatus | null>(null);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        if (fileUrl) {
            const audio = new Audio(fileUrl);

            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });

            audio.addEventListener('volumechange', () => setVolume(audio.volume));

            audio.addEventListener('play', () => setStatus('playing'));
            audio.addEventListener('pause', () => setStatus('paused'));

            setAudio(audio);
            setStatus('paused');

            return () => {
                // audio should be paused to let it be garbage-collected
                audio.pause();
            }
        }

        setAudio(null);
        setStatus(null);
        setDuration(null);
    }, [fileUrl]);

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

    const pause = () => {
        if (audio) {
            audio.pause();
        }
    }

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
        status,
        volume,
        play,
        togglePlay,
        pause,
        seek,
        setVolume: setUserVolume
    };
}