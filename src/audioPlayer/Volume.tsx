import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import style from './Volume.module.scss';
import { useState } from 'react';

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
                    min={0}
                    max={1}
                    value={volume}
                    step={0.01}
                    onChange={value => onChange?.(value as number)}
                    onChangeComplete={value => handleVolumeChangeComplete(value as number)}
                    className={style.volumeSlider}
                />
            </label>
        </div>
    )
}