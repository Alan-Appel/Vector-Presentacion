import { Easing, interpolate } from "remotion";

/**
 * Tokens tomados del portafolio (app/globals.css del repo alan-appel.github.io):
 * negro / blanco / azul Vector, Inter + JetBrains Mono. Instrument Serif en
 * itálica se suma solo como acento tipográfico del video.
 */
export const color = {
  bg: "#000000",
  panel: "rgba(16,18,24,0.82)",
  panelSolid: "#101218",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.16)",
  white: "#ffffff",
  text: "rgba(255,255,255,0.86)",
  muted: "rgba(255,255,255,0.45)",
  faint: "rgba(255,255,255,0.14)",
  blue: "#2563eb",
  blueLight: "#6c9bff",
  red: "#ff5a5f",
  amber: "#f5b544",
  green: "#3ddc97",
};

export const font = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  brand: '"Michroma", "Inter", sans-serif',
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);

/** 0→1 entre `start` y `start + duration`, con easing. */
export const prog = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = easeOut,
) => interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

/** Interpolación por keyframes `[frame, valor]` con easing en cada tramo. */
export const keys = (
  frame: number,
  frames: [number, number][],
  easing: (t: number) => number = easeInOut,
) =>
  interpolate(
    frame,
    frames.map((k) => k[0]),
    frames.map((k) => k[1]),
    { ...clamp, easing },
  );

/** Ruido determinístico (para temblores y posiciones "aleatorias" estables). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
