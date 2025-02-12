import { Slider } from "@/components/ui/slider";
import { useState } from 'react';
import style from './Volume.module.scss';

interface VolumeProps {
    volume?: number;
    onChange?: (value: number) => void;
}

export function Volume({ volume, onChange }: VolumeProps) {
    const [lastValue, setLastValue] = useState(volume || 1);

    const handleVolumeChangeComplete = (value: number) => {
        if (value > 0) {
            setLastValue(value);
        }
    }

    const toggleMute = () => {
        if (volume === 0) {
            onChange?.(lastValue);
        }
        else {
            onChange?.(0);
        }
    }

    return (
        <div>
            <button onClick={toggleMute}>{volume === 0 ? 'Unmute' : 'Mute'}</button>
            <label>
                Volume:
                <Slider
                    value={[volume ?? 1]}
                    max={1} 
                    step={0.01}
                    onValueChange={value => onChange?.(value[0])}
                    onValueCommit={value => handleVolumeChangeComplete(value[0])}
                    className={style.volumeSlider}
                />
            </label>
        </div>
    )
}