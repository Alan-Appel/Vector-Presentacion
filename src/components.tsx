import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { color, easeOut, font } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entre dos frames, con easing. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  ease: (t: number) => number = easeOut,
) => ease(interpolate(frame, [start, start + duration], [0, 1], clamp));

/** Grano sutil + viñeta: le quita lo "digital plano" al negro. */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ opacity: 0.07, mixBlendMode: "screen" }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Retícula técnica muy tenue, guiño al lenguaje "terminal" del portafolio. */
export const Grid: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill
    style={{
      opacity: 0.5 * opacity,
      backgroundImage: `linear-gradient(${color.line} 1px, transparent 1px), linear-gradient(90deg, ${color.line} 1px, transparent 1px)`,
      backgroundSize: "120px 120px",
      maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
    }}
  />
);

/** Etiqueta mono pequeña (sección / índice). */
export const MonoLabel: React.FC<{
  children: React.ReactNode;
  start: number;
  style?: React.CSSProperties;
}> = ({ children, start, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 18);
  const text = String(children);
  const chars = Math.round(text.length * progress(frame, start, 22, (t) => t));
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: 22,
        letterSpacing: "0.08em",
        color: color.muted,
        textTransform: "uppercase",
        opacity: p,
        ...style,
      }}
    >
      {text.slice(0, chars)}
    </div>
  );
};

/** Palabra que sube desde una máscara (reveal tipográfico). */
export const MaskWord: React.FC<{
  children: React.ReactNode;
  start: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ children, start, duration = 20, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration);
  return (
    <span
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.08em" }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${(1 - p) * 105}%)`,
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Subtítulos quemados: LinkedIn y WhatsApp reproducen sin sonido por defecto,
 * así que el mensaje tiene que entenderse también leyendo.
 */
export type Cue = { from: number; to: number; text: string };

export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const pIn = progress(frame, cue.from, 8);
  const pOut = 1 - progress(frame, cue.to - 6, 6);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 72 }}>
      <div
        style={{
          fontFamily: font.sans,
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.3,
          color: color.white,
          textAlign: "center",
          maxWidth: 1300,
          padding: "12px 26px",
          borderRadius: 10,
          background: "rgba(5,5,6,0.62)",
          backdropFilter: "blur(8px)",
          opacity: Math.min(pIn, pOut),
          transform: `translateY(${(1 - pIn) * 10}px)`,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

/** Marco de navegador mínimo para mostrar capturas reales de los proyectos. */
export const BrowserFrame: React.FC<{
  src: string;
  url: string;
  width: number;
  /** Zoom lento sobre la captura (1 = sin zoom). */
  zoom?: number;
  /** Punto de origen del zoom, en % (ej. "30% 20%"). */
  focus?: string;
}> = ({ src, url, width, zoom = 1, focus = "50% 50%" }) => (
  <div
    style={{
      width,
      borderRadius: 14,
      overflow: "hidden",
      background: color.surface,
      border: `1px solid ${color.line}`,
      boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
    }}
  >
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 18px",
        borderBottom: `1px solid ${color.line}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: color.faint }} />
      ))}
      <div
        style={{
          marginLeft: 18,
          flex: 1,
          height: 26,
          borderRadius: 7,
          background: "rgba(255,255,255,0.05)",
          fontFamily: font.mono,
          fontSize: 14,
          color: color.muted,
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
        }}
      >
        {url}
      </div>
    </div>
    <div style={{ height: width * 0.5625, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
          display: "block",
          transform: `scale(${zoom})`,
          transformOrigin: focus,
        }}
      />
    </div>
  </div>
);
