import { useEffect, useState } from "react";
import { useAudioCurrentTime } from "./useAudioCurrentTime";

type AudioStatus = 'playing' | 'paused' | 'stopped';

export function useAudio(fileUrl: string) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [loop, setLoop] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [status, setStatus] = useState<AudioStatus | null>(null);
    const [volume, setVolume] = useState(1);
    const [range, setRange] = useState<[number, number] | null>(null);
    const [currentTime, setCurrentTime] = useAudioCurrentTime(audio);

    useEffect(() => {
        if (fileUrl) {
            const audio = new Audio(fileUrl);

            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });

            audio.addEventListener('volumechange', () => setVolume(audio.volume));

            // audio.addEventListener('play', () => setStatus('playing'));
            // audio.addEventListener('pause', () => !audio.paused && setStatus('paused'));

            setAudio(audio);
            setStatus('stopped');

            return () => {
                // audio should be paused to let it be garbage-collected
                audio.pause();
                setAudio(null);
                setStatus(null);
                setDuration(null);
            }
        }
    }, [fileUrl]);

    const togglePlay = () => {
        if (audio) {
            if (status === 'paused' || status === 'stopped') {
                setStatus('playing');
                audio.play();
            } else {
                setStatus('paused');
                audio.pause();
            }
        }
    };

    const toggleLoop = () => {
        setLoop(!loop);
    };

    const setUserVolume = (volume: number) => {
        if (audio) {
            audio.volume = volume;
        }
    };

    const stop = () => {
        if (audio) {
            setStatus('stopped');
            audio.pause();
            setCurrentTime(range ? range[0] : 0);
        }
    }

    const handleSetRange = (newRange: [number, number] | null) => {
        setRange(newRange);

        if (newRange) {
            if (newRange[0] !== range?.[0]) {
                setCurrentTime(newRange[0]);
            }
        }
    }

    useEffect(() => {
        if (audio && range && typeof currentTime === 'number' && currentTime >= range[1]) {
            audio.currentTime = range[0];

            if (!loop) {
                setStatus('stopped');
                audio.pause();
            }
        }
    }, [audio, range, currentTime, loop]);

    useEffect(() => {
        if (audio) {
            const handleEnd = () => {
                audio.currentTime = range ? range[0] : 0;

                if (loop) {
                    audio.play();
                }
                else {
                    setStatus('stopped');
                    audio.pause();
                }
            }

            audio.addEventListener('ended', handleEnd);
            return () => audio.removeEventListener('ended', handleEnd);
        }
    }, [audio, range, loop]);

    return {
        audio,
        duration,
        currentTime,
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