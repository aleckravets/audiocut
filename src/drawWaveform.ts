const lineOffset = 0.7;

export function drawWaveform(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer
) {
  const rawData = audioBuffer.getChannelData(0);
  const barWidth = 2;
  const gap = 1;
  const step = Math.ceil(rawData.length / (canvas.width / (barWidth + gap))) // How many samples per bar

  // Normalize the data
  const normalizedData = [];

  for (let i = 0; i < rawData.length; i += step) {
    const slice = rawData.slice(i, i + step);
    const sum = slice.reduce((acc, val) => acc + Math.abs(val), 0);
    normalizedData.push(sum / slice.length);
  }

  // Scale the data to fit the canvas height
  const maxHeight = Math.max(...normalizedData);
  const scaledData = normalizedData.map(n => (n / maxHeight) * canvas.height);

  const context = canvas.getContext('2d')!;

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#fff';

  for (let i = 0; i < scaledData.length; i++) {
    const barHeight = scaledData[i];
    const x = i * (barWidth + gap);
    const y = (canvas.height - barHeight) * lineOffset;
    context.fillRect(x, y, barWidth, barHeight);
  }

  context.clearRect(0, canvas.height * lineOffset, canvas.width, 1);
}
