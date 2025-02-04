import { useEffect, useState } from "react";

export function useAudio(fileUrl: string) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>();
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        if (fileUrl) {
            const audio = new Audio(fileUrl);

            audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));

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

    const togglePlay = () => {
        if (audio) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
    };

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
        togglePlay,
        stop,
        seek,
        setVolume: setUserVolume
    };
}