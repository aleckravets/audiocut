export const clearCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}