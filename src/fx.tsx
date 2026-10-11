import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color, easeOut, font, hash, prog } from "./theme";

/** Grano de película + viñeta: le quita lo "digital plano" al negro. */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "screen" }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Luz ambiente azul que respira detrás de todo. */
export const AmbientGlow: React.FC<{ intensity?: number; x?: number; y?: number }> = ({
  intensity = 1,
  x = 50,
  y = 60,
}) => {
  const frame = useCurrentFrame();
  const breathe = 0.85 + 0.15 * Math.sin(frame / 22);
  return (
    <AbsoluteFill
      style={{
        opacity: intensity * breathe,
        background: `radial-gradient(ellipse 55% 45% at ${x}% ${y}%, rgba(37,99,235,0.22), rgba(37,99,235,0) 70%)`,
      }}
    />
  );
};

export type Part = { text: string; accent?: boolean; muted?: boolean };

/**
 * Titular cinético: cada palabra entra desde el desenfoque, con un leve
 * giro en X. Las palabras de acento van en serif itálica azul, con brillo.
 */
export const Headline: React.FC<{
  parts: Part[];
  start: number;
  exit?: number;
  size?: number;
  stagger?: number;
  align?: "left" | "center";
  width?: number;
  style?: React.CSSProperties;
}> = ({ parts, start, exit, size = 120, stagger = 4, align = "left", width, style }) => {
  const frame = useCurrentFrame();
  const out = exit === undefined ? 0 : prog(frame, exit, 14);
  const words: { word: string; part: Part; i: number }[] = [];
  parts.forEach((part) =>
    part.text.split(" ").forEach((word) => words.push({ word, part, i: words.length })),
  );
  return (
    <div
      style={{
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.045em",
        color: color.white,
        textAlign: align,
        width,
        perspective: 900,
        opacity: 1 - out,
        filter: `blur(${out * 14}px)`,
        transform: `translateY(${-out * 30}px)`,
        ...style,
      }}
    >
      {words.map(({ word, part, i }) => {
        const p = prog(frame, start + i * stagger, 22, easeOut);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: p,
              filter: `blur(${(1 - p) * 16}px)`,
              transform: `translateY(${(1 - p) * 40}px) rotateX(${(1 - p) * -50}deg) scale(${1 + (1 - p) * 0.08})`,
              transformOrigin: "50% 100%",
              ...(part.accent
                ? {
                    fontFamily: font.serif,
                    fontStyle: "italic",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    fontSize: "1.12em",
                    lineHeight: 0.9,
                    color: color.blueLight,
                    textShadow: `0 0 40px rgba(37,99,235,0.55)`,
                  }
                : part.muted
                  ? { color: "rgba(255,255,255,0.38)" }
                  : null),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Etiqueta mono que se "tipea", con cursor. */
export const MonoTag: React.FC<{ text: string; start: number; exit?: number; style?: React.CSSProperties }> = ({
  text,
  start,
  exit,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.round(text.length * prog(frame, start, 16, (t) => t));
  const out = exit === undefined ? 0 : prog(frame, exit, 10);
  const caret = frame - start < 26 && Math.floor(frame / 4) % 2 === 0;
  if (frame < start) return null;
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: 20,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color.blueLight,
        opacity: 1 - out,
        ...style,
      }}
    >
      {text.slice(0, chars)}
      <span style={{ opacity: caret ? 1 : 0 }}>▍</span>
    </div>
  );
};

/** Polvo en suspensión: puntos con profundidad que dan escala al espacio. */
export const Dust: React.FC<{ count?: number; spread?: number }> = ({ count = 60, spread = 3200 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = (hash(i) - 0.5) * spread;
        const y = (hash(i + 99) - 0.5) * spread * 0.55 + Math.sin(frame / 40 + i) * 12;
        const z = (hash(i + 7) - 0.6) * 1800;
        const s = 2 + hash(i + 3) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: s,
              height: s,
              borderRadius: s,
              background: i % 7 === 0 ? color.blueLight : "white",
              opacity: 0.18 + hash(i + 5) * 0.3,
              transform: `translate3d(${x}px, ${y - frame * (0.3 + hash(i) * 0.5)}px, ${z}px)`,
            }}
          />
        );
      })}
    </>
  );
};

/** Plano de piso con retícula, para que el espacio 3D se lea como espacio. */
export const FloorGrid: React.FC<{ y?: number; opacity?: number }> = ({ y = 520, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      width: 6000,
      height: 6000,
      left: -3000,
      top: -3000,
      opacity: 0.55 * opacity,
      transform: `translateY(${y}px) rotateX(90deg)`,
      backgroundImage: `linear-gradient(${color.line} 2px, transparent 2px), linear-gradient(90deg, ${color.line} 2px, transparent 2px)`,
      backgroundSize: "160px 160px",
      maskImage: "radial-gradient(circle at center, black 0%, transparent 45%)",
    }}
  />
);

/** Panel de vidrio oscuro: base visual de todas las interfaces. */
export const Glass: React.FC<{
  width: number;
  height: number;
  title?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ width, height, title, badge, children, accent, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      background: `linear-gradient(160deg, rgba(30,34,44,0.92), ${color.panel})`,
      border: `1px solid ${color.lineStrong}`,
      boxShadow: `0 50px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)${accent ? `, 0 0 80px ${accent}` : ""}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: font.sans,
      color: color.text,
      ...style,
    }}
  >
    {title !== undefined && (
      <div
        style={{
          height: 54,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          borderBottom: `1px solid ${color.line}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: color.faint }} />
        ))}
        <div style={{ marginLeft: 12, fontSize: 17, fontWeight: 500, color: color.muted, flex: 1 }}>{title}</div>
        {badge}
      </div>
    )}
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);
