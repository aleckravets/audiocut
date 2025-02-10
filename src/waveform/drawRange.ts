import { Range } from "../types/Range";

export const drawRange = (canvas: HTMLCanvasElement, range: Range | null) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!range) return;

    const { start, end } = range;

    // ctx.beginPath();
    // ctx.strokeStyle = '#ffa500';
    // ctx.lineWidth = 2;

    // ctx.moveTo(start, 0);
    // ctx.lineTo(start, canvas.height);
    // ctx.moveTo(end, 0);
    // ctx.lineTo(end, canvas.height);
    // ctx.stroke();

    ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
    ctx.fillRect(start * canvas.width, 0, (end - start) * canvas.width, canvas.height);
}