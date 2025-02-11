import { useState, useRef, useEffect } from "react";

export const useAudioCurrentTime = (audio: HTMLAudioElement | null) => {
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const animationFrameId = useRef<number | null>(null);

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

    const setter = (time: number) => {
        if (audio) {
            audio.currentTime = time;
            setCurrentTime(time);
        }
    }

    return [currentTime, setter] as const;
};
