import { useEffect, useState, useRef } from "react";
import { Range } from '../types/Range';

type AudioStatus = 'playing' | 'paused' | 'stopped';

export function useAudio(fileUrl: string) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [loop, setLoop] = useState(true);
    const [duration, setDuration] = useState<number | null>(null);
    const [status, setStatus] = useState<AudioStatus | null>(null);
    const [volume, setVolume] = useState(1);
    const [range, setRange] = useState<Range | null>(null);
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const animationFrameId = useRef<number | null>(null);

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
            }
        }

        setAudio(null);
        setStatus(null);
        setDuration(null);
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

    const seek = (time: number) => {
        if (audio) {
            audio.currentTime = time;
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
            seek(range ? range.start : 0);
        }
    }

    const handleSetRange = (newRange: Range | null) => {
        setRange(newRange);

        if (newRange) {
            if (newRange.start !== range?.start) {
                seek(newRange.start);
            }
        }
        else {
            seek(0);
        }
    }

    const handleEnd = () => {
        if (loop) {
            seek(range ? range.start : 0);
            audio?.play(); // needed in case of ended event
        }
        else {
            stop();
        }
    }

    useEffect(() => {
        if (range && currentTime && currentTime >= range.end) {
            handleEnd();
        }
    }, [currentTime, range, handleEnd]);

    useEffect(() => {
        audio?.addEventListener('ended', handleEnd);
    }, [audio, handleEnd]);

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
        seek,
        toggleLoop,
        setVolume: setUserVolume,
        setRange: handleSetRange
    };
}