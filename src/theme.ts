/**
 * Tokens tomados del portafolio (app/globals.css del repo alan-appel.github.io):
 * negro / blanco / azul Vector, Inter + JetBrains Mono.
 */
export const color = {
  bg: "#000000",
  surface: "#0e0f12",
  line: "rgba(255,255,255,0.10)",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.42)",
  faint: "rgba(255,255,255,0.18)",
  blue: "#2563eb",
  blueLight: "#5b8cff",
};

export const font = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Curva de salida suave usada en casi todas las entradas. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOut = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
