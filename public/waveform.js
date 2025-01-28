const audioFileInput = document.getElementById('audioFile');
const canvas = document.getElementById('waveformCanvas');
const ctx = canvas.getContext('2d');


audioFileInput.addEventListener('change', (event) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                drawWaveform(audioBuffer);
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

function drawWaveform(audioBuffer) {
    const rawData = audioBuffer.getChannelData(0); // Use the first channel
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const barWidth = 2; // Width of each vertical bar
    const gap = 1; // Gap between bars
    const step = Math.ceil(rawData.length / (canvasWidth / (barWidth + gap))); // How many samples per bar

    // Normalize the data
    const filteredData = [];
    for (let i = 0; i < rawData.length; i += step) {
        const slice = rawData.slice(i, i + step);
        const sum = slice.reduce((acc, val) => acc + Math.abs(val), 0);
        filteredData.push(sum / slice.length);
    }

    // Scale the data to fit the canvas height
    const maxHeight = Math.max(...filteredData);
    const scaledData = filteredData.map(n => (n / maxHeight) * canvasHeight);

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw bars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < scaledData.length; i++) {
        const barHeight = scaledData[i];
        const x = i * (barWidth + gap);
        const y = canvasHeight - barHeight;
        ctx.fillRect(x, y, barWidth, barHeight);
    }
}
