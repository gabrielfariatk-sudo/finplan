let ctx: AudioContext | null = null;

// Bip digital curto (onda quadrada, som de "computador")
function beep(
  audio: AudioContext,
  start: number,
  freq: number,
  duration: number,
  volume: number,
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// Sweep "energizando", com filtro que abre rápido
function sweep(audio: AudioContext, start: number) {
  const osc = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, start);
  osc.frequency.exponentialRampToValueAtTime(900, start + 0.18);

  filter.type = "lowpass";
  filter.Q.value = 8;
  filter.frequency.setValueAtTime(300, start);
  filter.frequency.exponentialRampToValueAtTime(4000, start + 0.18);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + 0.25);
}

export async function playHoverSound() {
  if (typeof window === "undefined") return;

  try {
    ctx ??= new AudioContext();

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") return;

    const now = ctx.currentTime;

    sweep(ctx, now);
    beep(ctx, now + 0.0, 1320, 0.05, 0.03);
    beep(ctx, now + 0.06, 1760, 0.05, 0.03);
    beep(ctx, now + 0.12, 2640, 0.08, 0.025);
  } catch {
    // áudio bloqueado pelo navegador; ignora sem quebrar a página
  }
}