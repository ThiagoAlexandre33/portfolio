// Som ambiente gerado no navegador (sem arquivo de áudio para baixar).
// Um acorde grave e um "vento" filtrado, que entram e saem suavemente.

export function createAmbient() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  filter.connect(master);

  // Acorde: Lá grave com quinta e nona, levemente desafinados para "respirar"
  const notes = [55, 82.41, 110, 123.47, 164.81];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i % 2 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    osc.detune.value = (i - 2) * 4;
    const g = ctx.createGain();
    g.gain.value = 0.09 / (i + 1);
    osc.connect(g).connect(filter);
    osc.start();
  });

  // Vento: ruído branco passando por um filtro passa-banda que oscila devagar
  const len = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 500;
  band.Q.value = 0.8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.035;
  noise.connect(band).connect(noiseGain).connect(master);
  noise.start();

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 320;
  lfo.connect(lfoDepth).connect(band.frequency);
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  let on = false;

  return {
    toggle() {
      on = !on;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(on ? 0.5 : 0, now + (on ? 1.8 : 0.6));
      return on;
    },
  };
}
