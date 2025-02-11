const drawCurrentTime = (canvas: HTMLCanvasElement, offsetRatio: number | null) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (typeof offsetRatio !== 'number') return;
    
    const offset = offsetRatio * canvas.width;

    // Draw the vertical line (current time)
    ctx.beginPath();
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 1;
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, canvas.height);
    ctx.stroke();
}

export default drawCurrentTime;
