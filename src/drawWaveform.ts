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

  // context.fillStyle = '#fff';
  context.fillStyle = canvasLinearGradient(context, waveGradient);

  for (let i = 0; i < scaledData.length; i++) {
    const barHeight = scaledData[i];
    const x = i * (barWidth + gap);
    const y = (canvas.height - barHeight) * lineOffset;
    context.fillRect(x, y, barWidth, barHeight);
  }

  context.clearRect(0, canvas.height * lineOffset, canvas.width, 1);
}

function canvasLinearGradient(canvasCtx: any, colorStops: any) {

  var l = canvasCtx.canvas.height; // Gradient Size

  var u = colorStops.map(function (stop: any) {
    var opacity = stop.length === 3 ? stop[2] : 1;

    return [stop[0], stop[1], opacity]
  })

  return u.reduce(function (e: any, stop: any) {
    var sValue = stop[0],
      color = stop[1],
      opacity = stop[2],
      clr = "rgba(" + color + "," + opacity + ")";

    return e.addColorStop(sValue, clr), e;

  }, canvasCtx.createLinearGradient(0, 0, 0, l))
}

const waveGradient = [[0, "255,255,255"], [0.7, "255,255,255"], [0.701, "229,229,229"], [1, "229,229,229"]];