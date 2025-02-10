const drawCurrentTime = (canvas: HTMLCanvasElement, currentTimeOffset: number) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the vertical line (current time)
    ctx.beginPath();
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 1;
    ctx.moveTo(currentTimeOffset, 0);
    ctx.lineTo(currentTimeOffset, canvas.height);
    ctx.stroke();
}

export default drawCurrentTime;
